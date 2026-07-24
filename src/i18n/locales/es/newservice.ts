// i18n translations (Spanish) for the New Service / Create Post form screen

export const newservice = {
  title: "Crear Nueva Publicación de Servicio",
  subtitle:
    "Completa los detalles para encontrar al profesional perfecto para tus necesidades.",
  steps: {
    step1: "Info Básica",
    step2: "Detalles",
    step3: "Fotos",
  },
  basicInfo: {
    sectionTitle: "Información Básica",
    titleLabel: "¿Con qué necesitas ayuda?",
    titlePlaceholder: "ej. Cerrajero de emergencia para puerta principal",
    categoryLabel: "Categoría de Servicio",
    categoryPlaceholder: "Seleccionar Categoría",
    descriptionLabel: "Descripción Detallada",
    descriptionPlaceholder:
      "Describe el problema con detalle. Incluye requisitos específicos, marcas de aparatos si aplica, o instrucciones de acceso.",
    descriptionLimit: "caracteres",
  },
  details: {
    sectionTitle: "Detalles",
    locationLabel: "Ubicación",
    locationPlaceholder: "Dirección o Ciudad",
    dateLabel: "Fecha y Hora",
    datePlaceholder: "Fecha y Hora Programada",
    budgetLabel: "Presupuesto",
    budgetPlaceholder: "0.00",
    currency: "MXN",
    changeLocation: "Cambiar Ubicación",
    useCurrentLocation: "Mi ubicación actual",
    locatingCurrentLocation: "Obteniendo tu ubicación...",
    resolvingLocation: "Buscando ubicación...",
    mapPlaceholder: "Escribe una colonia y presiona Enter",
    locationApproxNote:
      "Solo se guarda la colonia y ciudad aproximada, nunca tu dirección exacta.",
  },
  photos: {
    sectionTitle: "Fotos",
    uploadLabel: "Click para subir",
    uploadHint: "SVG, PNG, JPG, o GIF (MÁX. 800×400px)",
    uploadTitle: "Arrastra y suelta o",
    uploadButton: "Subir Archivo",
    uploadSubtitle: "o arrastra tus archivos aquí",
    uploading: "Subiendo...",
    cancel: "Cancelar",
    maxFiles: "Máx 6 archivos",
    errorType: "Tipo de archivo inválido",
    errorSize: "El archivo supera 5MB",
    addMoreHint: "Arrastra o haz clic para agregar más fotos (máx 6)",
  },
  actions: {
    postService: "Publicar Servicio",
    cancel: "Limpiar Formulario",
    next: "Siguiente",
    back: "Atrás",
    reviewPost: "Revisar Publicación",
  },
  categories: [
    "Plomería",
    "Electricidad",
    "Cerrajería",
    "Limpieza",
    "Pintura",
    "Carpintería",
    "Aire Acondicionado",
    "Control de Plagas",
    "Mudanza",
    "Otro",
  ],
  validation: {
    titleRequired: "Por favor ingresa un título para tu solicitud.",
    titleUnsafe: "El título contiene caracteres no permitidos (< o >).",
    categoryRequired: "Por favor selecciona una categoría.",
    categoriesUnavailable:
      "No se pudieron cargar las categorías. Intenta de nuevo más tarde.",
    descriptionRequired: "Por favor agrega una descripción.",
    descriptionUnsafe:
      "La descripción contiene caracteres no permitidos (< o >).",
    locationRequired: "Por favor ingresa una ubicación.",
    locationNotResolved:
      "Presiona Enter para ubicar tu colonia, o usa tu ubicación actual.",
    budgetInvalid: "Ingresa un presupuesto válido (mayor a 0, máx. 2 decimales).",
  },
  errors: {
    locationNotFound: "No se encontró esa ubicación. Intenta ser más específico.",
    geolocationDenied: "No pudimos acceder a tu ubicación. Revisa los permisos.",
    geolocationUnsupported: "Tu navegador no soporta geolocalización.",
    photoTooLarge: "supera 5MB y no se agregó.",
    submitFailed: "No se pudo publicar el servicio. Intenta de nuevo.",
  },
  success: {
    posted: "¡Servicio publicado con éxito!",
  },
};
