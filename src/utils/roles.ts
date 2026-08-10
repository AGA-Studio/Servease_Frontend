import type { UserRole } from "../context/AuthContext";

// Espeja la jerarquia de roles del backend (usuarios/permissions.py):
// admin hereda todo lo de proveedor, y proveedor hereda todo lo de cliente
// (ej. un proveedor puede publicar su propio servicio y pagarlo/calificarlo
// como cliente).
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  client: ["client"],
  provider: ["client", "provider"],
  admin: ["client", "provider", "admin"],
};

export function roleHasCapability(role: UserRole, capability: UserRole): boolean {
  return ROLE_HIERARCHY[role].includes(capability);
}
