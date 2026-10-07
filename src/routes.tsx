import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { VisitTracker } from './components/visits/VisitTracker';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminVisitsPage } from './pages/admin/AdminVisitsPage';
import { AccountPage } from './pages/AccountPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { GatheringPage } from './pages/GatheringPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { InvitePage } from './pages/InvitePage';
import { ItineraryPage } from './pages/ItineraryPage';
import { LoginPage } from './pages/LoginPage';
import { MyPlansPage } from './pages/MyPlansPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { RefinePage } from './pages/RefinePage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SendPage } from './pages/SendPage';
import { NotFoundPage, PrivacyPage, TermsPage } from './pages/StaticPages';
import { SuggestionsPage } from './pages/SuggestionsPage';
import { WeekendPage } from './pages/WeekendPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <VisitTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/plan/:planType" element={<QuestionsPage />} />
        <Route path="/plan/:planType/gathering" element={<GatheringPage />} />
        <Route path="/plan/:planType/suggestions" element={<SuggestionsPage />} />
        <Route path="/plan/:planType/refine" element={<RefinePage />} />
        <Route path="/plan/:planType/confirm" element={<ConfirmPage />} />
        <Route path="/plan/:planType/itinerary" element={<ItineraryPage />} />
        <Route path="/plan/:planType/send" element={<SendPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/weekend" element={<WeekendPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/plans" element={<MyPlansPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/visits" element={<AdminVisitsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
