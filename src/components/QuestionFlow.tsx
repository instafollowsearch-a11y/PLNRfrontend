import type { QuestionConfig } from '../constants/questionFlows';
import { useEffect, useMemo, useState } from 'react';

import { isAnswerComplete, serializeAnswersForApi } from '../lib/fieldValues';
import { QuestionField } from './fields/QuestionField';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import './QuestionFlow.css';

type QuestionFlowProps = {
  questions: QuestionConfig[];
  onComplete: (answers: Record<string, string>) => Promise<void>;
};

function getVisibleQuestions(
  questions: QuestionConfig[],
  answers: Record<string, string>,
): QuestionConfig[] {
  return questions.filter((question) => !question.showIf || question.showIf(answers));
}

export function QuestionFlow({ questions, onComplete }: QuestionFlowProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(questions, answers),
    [questions, answers],
  );

  useEffect(() => {
    if (step >= visibleQuestions.length && visibleQuestions.length > 0) {
      setStep(visibleQuestions.length - 1);
    }
  }, [step, visibleQuestions.length]);

  const current = visibleQuestions[step];
  const currentValue = answers[current?.key ?? ''] ?? '';
  const isLastStep = step === visibleQuestions.length - 1;

  const progressLabel = useMemo(
    () => `Step ${step + 1} of ${visibleQuestions.length}`,
    [step, visibleQuestions.length],
  );

  if (!current) {
    return null;
  }

  function validateCurrent(): boolean {
    if (!isAnswerComplete(current, currentValue)) {
      if (current.type === 'date_range') {
        setError('Choose a valid start and end date.');
      } else if (current.type === 'datetime_range') {
        setError('Choose a date and both start and end times.');
      } else if (current.type === 'location') {
        setError('Select a location from search or the map.');
      } else if (current.type === 'interests') {
        setError('Pick at least one interest or add your own.');
      } else if (current.type === 'select') {
        setError('Choose an option.');
      } else if (current.type === 'number' && Number.isNaN(Number(currentValue))) {
        setError('Enter a valid number.');
      } else {
        setError('This field is required.');
      }

      return false;
    }

    setError(null);

    return true;
  }

  async function handleNext() {
    if (!validateCurrent()) {
      return;
    }

    if (!isLastStep) {
      setStep((value) => value + 1);
      setError(null);

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = serializeAnswersForApi(visibleQuestions, answers);
      await onComplete(payload);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (step === 0) {
      return;
    }

    setError(null);
    setStep((value) => value - 1);
  }

  return (
    <Card className="question-flow-card">
      <div className="question-flow">
        <div className="question-flow__header">
          <ProgressBar step={step} total={visibleQuestions.length} />
          <p className="question-flow__progress">{progressLabel}</p>
        </div>

        <div className="question-flow__body">
          <h2 className="question-flow__label">{current.label}</h2>
          {current.hint ? <p className="question-flow__hint">{current.hint}</p> : null}

          <QuestionField
            question={current}
            value={currentValue}
            onChange={(value) => {
              setAnswers((prev) => ({ ...prev, [current.key]: value }));
              setError(null);
            }}
          />

          {error ? <p className="error-text">{error}</p> : null}
        </div>

        <div className="question-flow__actions">
          {step > 0 ? <Button label="Back" variant="secondary" onClick={handleBack} /> : null}
          <Button
            label={isLastStep ? 'Get suggestions' : 'Continue'}
            onClick={() => void handleNext()}
            loading={isSubmitting}
          />
        </div>
      </div>
    </Card>
  );
}
