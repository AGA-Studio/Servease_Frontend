export const ratingmodal = {
  title: "Completar Servicio y Calificar Experiencia",
  subtitle: "Tu opinión ayuda a mantener nuestra comunidad profesional",
  completed: "Completado",
  reviews: "reseñas",
  selectRating: "SELECCIONA TU CALIFICACIÓN",
  shareExperience: "ELIGE UN COMENTARIO (OPCIONAL)",
  submit: "Enviar Calificación",
  submitting: "Enviando...",
  messagesByRating: {
    5: [
      "Cliente excelente, comunicación clara",
      "Muy puntual y respetuoso",
      "Todo perfecto durante el servicio",
    ],
    4: [
      "Buen cliente, sin problemas",
      "Comunicación clara y directa",
      "Trato correcto durante el servicio",
    ],
    3: [
      "Cliente correcto, cumplió lo básico",
      "Comunicación aceptable",
      "Sin mayores inconvenientes",
    ],
    2: [
      "Hubo dificultades de comunicación",
      "Cambios de último momento",
      "Experiencia por debajo de lo esperado",
    ],
    1: [
      "Muy mala experiencia con el cliente",
      "Falta de respeto durante el servicio",
      "No lo recomiendo",
    ],
  } as Record<number, string[]>,
};
