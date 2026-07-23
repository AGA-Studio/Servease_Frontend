// Defines all application routes, protected routes, and role-based access control routing.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { ROUTES } from "./routes";

import AuthScreen from "../screens/auth/AuthScreen";
import ConfirmEmailScreen from "../screens/auth/ConfirmEmailScreen";
import TermsScreen from "../screens/legal/TermsScreen";
import PrivacyScreen from "../screens/legal/PrivacyScreen";
import AppLayout from "../layouts/AppLayout";
import AdminLayout from "../layouts/AdminLayout";

import HomeScreen from "../screens/app/HomeScreen";
import DashboardScreen from "../screens/app/DashboardScreen";
import MyPostScreen from "../screens/app/MyPostScreen";
import PostOffersScreen from "../screens/app/PostOffersScreen";
import PostDetailsScreen from "../screens/app/PostDetailsScreen";
import NewServiceScreen from "../screens/app/NewServiceScreen";
import MessagesScreen from "../screens/app/MessagesScreen";
import JobFeedScreen from "../screens/app/JobFeedScreen";
import MyJobsScreen from "../screens/app/MyJobsScreen";
import ProfileScreen from "../screens/app/ProfileScreen";
import SettingsScreen from "../screens/app/SettingsScreen";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminPostsScreen from "../screens/admin/AdminPostsScreen";
import AdminLogsScreen from "../screens/admin/AdminLogsScreen";

const getDefaultAppRoute = (role?: string) => {
  if (role === "admin") return ROUTES.ADMIN.DASHBOARD;
  if (role === "provider") return ROUTES.APP.DASHBOARD;
  return ROUTES.APP.HOME;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to={ROUTES.AUTH} replace />;
  return <Navigate to={getDefaultAppRoute(user?.role)} replace />;
};

const AppIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  return <Navigate to={getDefaultAppRoute(user?.role)} replace />;
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path={ROUTES.AUTH} element={<AuthScreen />} />
      <Route path={ROUTES.CONFIRM_EMAIL} element={<ConfirmEmailScreen />} />
      <Route path={ROUTES.TERMS} element={<TermsScreen />} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyScreen />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AppIndexRedirect />} />
        <Route path="home" element={<HomeScreen />} />
        <Route
          path="dashboard"
          element={
            <RoleRoute allowedRoles={["provider"]}>
              <DashboardScreen />
            </RoleRoute>
          }
        />
        <Route path="my-post" element={<MyPostScreen />} />
        <Route path="my-post/:postId" element={<PostOffersScreen />} />
        <Route path="my-post/:postId/details" element={<PostDetailsScreen />} />
        <Route path="new-service" element={<NewServiceScreen />} />
        <Route path="messages" element={<MessagesScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route
          path="job-feed"
          element={
            <RoleRoute allowedRoles={["provider"]}>
              <JobFeedScreen />
            </RoleRoute>
          }
        />
        <Route
          path="my-jobs"
          element={
            <RoleRoute allowedRoles={["provider"]}>
              <MyJobsScreen />
            </RoleRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
        <Route path="dashboard" element={<AdminDashboardScreen />} />
        <Route path="users" element={<AdminUsersScreen />} />
        <Route path="posts" element={<AdminPostsScreen />} />
        <Route path="logs" element={<AdminLogsScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
