import type { MyJob, ProposalStatus } from "../types/myjobs";
import type { TrabajoAplicado } from "../api/userApi";
import { timeAgo } from "./servicio";

export const mapEstadoToProposalStatus = (
  estado: string,
): ProposalStatus => {
  switch (estado.trim().toLowerCase()) {
    case "aceptado":
    case "aceptada":
      return "accepted";
    case "rechazada":
    case "rechazado":
      return "rejected";
    case "contraoferta":
      return "counteroffer";
    default:
      return "pending";
  }
};

export const mapTrabajoAplicadoToMyJob = (item: TrabajoAplicado): MyJob => ({
  id: String(item.id_postulacion),
  id_servicio: item.id_servicio,
  title: item.titulo,
  category: item.categoria,
  proposalStatus: mapEstadoToProposalStatus(item.estado),
  postedAgo: timeAgo(item.fecha_publicacion),
  budget: Number(item.precio_final),
  currency: item.moneda ?? "MXN",
  imageUrl: item.foto ?? undefined,
});
