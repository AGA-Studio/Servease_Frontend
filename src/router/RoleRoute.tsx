// Restricts route access based on user role hierarchy, redirecting unauthorized users to the dashboard.

import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { ROUTES } from "./routes";

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  client: ["client"],
  provider: ["client", "provider"],
  admin: ["client", "provider", "admin"],
};

const RoleRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to={ROUTES.AUTH} replace />;

  const userEffectiveRoles = ROLE_HIERARCHY[user.role];
  const hasAccess = allowedRoles.some((r) => userEffectiveRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to={ROUTES.APP.HOME} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
