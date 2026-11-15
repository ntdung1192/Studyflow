import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import WorkspacePage from './features/dashboard/pages/WorkspacePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects" element={<WorkspacePage />} />
          <Route path="/tasks" element={<WorkspacePage />} />
          <Route path="/schedule" element={<WorkspacePage />} />
          <Route path="/goals" element={<WorkspacePage />} />
          <Route path="/groups" element={<WorkspacePage />} />
          <Route path="/analytics" element={<WorkspacePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
