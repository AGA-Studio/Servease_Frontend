import { useAuth } from "../../context/AuthContext";
import ClientProfileScreen from "./ClientProfileScreen";
import ProviderProfileScreen from "./ProviderProfileScreen";

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "provider" || role === "admin") {
    return <ProviderProfileScreen />;
  }

  return <ClientProfileScreen />;
};

export default ProfileScreen;
