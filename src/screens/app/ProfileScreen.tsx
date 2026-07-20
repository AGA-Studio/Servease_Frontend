import { useAuth } from "../../context/AuthContext";
import ClientProfileScreen from "./ClientProfileScreen";
import ProviderProfileScreen from "./ProviderProfileScreen";

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === "provider") return <ProviderProfileScreen />;
  return <ClientProfileScreen />;
};

export default ProfileScreen;
