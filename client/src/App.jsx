import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './features/auth/RouteGuards';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import WorkspacePage from './features/dashboard/pages/WorkspacePage';
import GroupDetailPage from './features/groups/pages/GroupDetailPage';
import GroupsPage from './features/groups/pages/GroupsPage';
import GoalsPage from './features/personal/pages/GoalsPage';
import SubjectsPage from './features/personal/pages/SubjectsPage';
import TasksPage from './features/personal/pages/TasksPage';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/schedule" element={<WorkspacePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailPage />} />
            <Route path="/analytics" element={<WorkspacePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
