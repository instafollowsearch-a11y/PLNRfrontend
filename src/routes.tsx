import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ConfirmPage } from './pages/ConfirmPage';
import { HomePage } from './pages/HomePage';
import { ItineraryPage } from './pages/ItineraryPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { RefinePage } from './pages/RefinePage';
import { SendPage } from './pages/SendPage';
import { NotFoundPage, PrivacyPage, TermsPage } from './pages/StaticPages';
import { SuggestionsPage } from './pages/SuggestionsPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plan/:planType" element={<QuestionsPage />} />
        <Route path="/plan/:planType/suggestions" element={<SuggestionsPage />} />
        <Route path="/plan/:planType/refine" element={<RefinePage />} />
        <Route path="/plan/:planType/confirm" element={<ConfirmPage />} />
        <Route path="/plan/:planType/itinerary" element={<ItineraryPage />} />
        <Route path="/plan/:planType/send" element={<SendPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
