export const clientratingmodal = {
  title: "Califica tu Experiencia",
  subtitle: "Tu servicio fue marcado como completado. Comparte tu opinión sobre el proveedor.",
  completed: "Completado",
  selectRating: "SELECCIONA TU CALIFICACIÓN",
  shareExperience: "ELIGE UN COMENTARIO (OPCIONAL)",
  submit: "Enviar Calificación",
  submitting: "Enviando...",
  success: "¡Gracias por tu calificación!",
  error: "No se pudo enviar tu calificación. Intenta de nuevo.",
  messagesByRating: {
    5: [
      "Excelente servicio, superó mis expectativas",
      "Muy profesional y puntual",
      "Trabajo de gran calidad, lo recomiendo",
    ],
    4: [
      "Buen servicio, cumplió lo acordado",
      "Profesional y responsable",
      "Quedé satisfecho con el resultado",
    ],
    3: [
      "El servicio cumplió lo básico",
      "Podría mejorar en algunos aspectos",
      "Resultado aceptable",
    ],
    2: [
      "El servicio no cumplió mis expectativas",
      "Hubo problemas de comunicación",
      "El trabajo no fue como se acordó",
    ],
    1: [
      "Muy mala experiencia",
      "No cumplió con lo prometido",
      "No lo recomiendo",
    ],
  } as Record<number, string[]>,
};
