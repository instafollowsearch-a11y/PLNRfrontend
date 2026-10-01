import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import { Button } from './ui/Button';
import { Input } from './ui/Input';
import './RefinementChat.css';

type RefinementMessage = {
  role: string;
  content: string;
  created_at?: string;
};

type RefinementChatProps = {
  messages?: RefinementMessage[];
  onSubmit: (message: string) => Promise<void>;
  children?: ReactNode;
};

const QUICK_PROMPTS = ['Something cheaper', 'More low-key', 'Like this but different'];
const ASSISTANT_PROMPT = 'Tell me what you would like instead. I will fetch new suggestions.';

export function RefinementChat({ messages = [], onSubmit, children }: RefinementChatProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const userMessages = messages.filter((item) => item.role === 'user');
  const thread: RefinementMessage[] = [{ role: 'assistant', content: ASSISTANT_PROMPT }, ...messages];

  useEffect(() => {
    if (children) {
      return;
    }

    const container = messagesRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight });
  }, [children, thread.length]);

  async function handleSubmit(message: string) {
    const trimmed = message.trim();

    if (!trimmed) {
      setError('Tell us what you would like instead.');

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmed);
      setDraft('');
    } catch {
      setError('Unable to refine suggestions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const composer = (
    <>
      <div className="refinement-chat__chips">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="refinement-chat__chip"
            onClick={() => void handleSubmit(prompt)}
            disabled={isSubmitting}
          >
            {prompt}
          </button>
        ))}
      </div>

      <Input
        multiline
        rows={3}
        placeholder='e.g. "Something more low-key" or "Anything like this but cheaper"'
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />

      {error ? <p className="error-text">{error}</p> : null}

      <Button
        label="Get new suggestions"
        onClick={() => void handleSubmit(draft)}
        loading={isSubmitting}
      />
    </>
  );

  if (children) {
    return (
      <>
        {userMessages.length > 0 ? (
          <div className="refinement-chat__requests">
            <MessageList messages={userMessages} />
          </div>
        ) : null}
        {children}
        <div className="refinement-chat">
          <MessageList messages={[{ role: 'assistant', content: ASSISTANT_PROMPT }]} />
          {composer}
        </div>
      </>
    );
  }

  return (
    <div className="refinement-chat">
      <MessageList messages={thread} listRef={messagesRef} />
      {composer}
    </div>
  );
}

function MessageList({
  messages,
  listRef,
}: {
  messages: RefinementMessage[];
  listRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="refinement-chat__messages" ref={listRef}>
      {messages.map((item, index) => {
        const isUser = item.role === 'user';

        return (
          <div
            key={`${item.role}-${index}`}
            className={`refinement-chat__row ${isUser ? 'refinement-chat__row--user' : ''}`}
          >
            <div className={`refinement-chat__bubble ${isUser ? 'refinement-chat__bubble--user' : ''}`}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
