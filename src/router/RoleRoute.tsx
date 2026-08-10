

import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";
import { ROUTES } from "./routes";
import { roleHasCapability } from "../utils/roles";

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to={ROUTES.AUTH} replace />;

  const hasAccess = allowedRoles.some((r) => roleHasCapability(user.role, r));

  if (!hasAccess) {
    return <Navigate to={ROUTES.APP.HOME} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
