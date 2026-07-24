// i18n translations (English) for the New Service / Create Post form screen

export const newservice = {
  title: "Create New Service Publication",
  subtitle:
    "Fill in the details below to find the perfect professional for your needs.",
  steps: {
    step1: "Basic Info",
    step2: "Details",
    step3: "Photos",
  },
  basicInfo: {
    sectionTitle: "Basic Information",
    titleLabel: "What help do you need?",
    titlePlaceholder: "e.g. Emergency Locksmith required for front door",
    categoryLabel: "Service Category",
    categoryPlaceholder: "Select Category",
    descriptionLabel: "Detailed Description",
    descriptionPlaceholder:
      "Describe the problem in detail. Include specific requirements, brand names of appliances if relevant, or access instructions.",
    descriptionLimit: "characters",
  },
  details: {
    sectionTitle: "Details",
    locationLabel: "Location",
    locationPlaceholder: "Address or City",
    dateLabel: "Date & Time",
    datePlaceholder: "Scheduled Date & Time",
    budgetLabel: "Budget",
    budgetPlaceholder: "0.00",
    currency: "MXN",
    changeLocation: "Change Location",
    useCurrentLocation: "My current location",
    locatingCurrentLocation: "Getting your location...",
    resolvingLocation: "Locating...",
    mapPlaceholder: "Type a neighborhood and press Enter",
    locationApproxNote:
      "Only the approximate neighborhood and city are saved, never your exact address.",
  },
  photos: {
    sectionTitle: "Photos",
    uploadLabel: "Click to upload",
    uploadHint: "SVG, PNG, JPG, or GIF (MAX. 800×400px)",
    uploadTitle: "Drag and drop or",
    uploadButton: "Upload File",
    uploadSubtitle: "or drag and drop your files here",
    uploading: "Uploading...",
    cancel: "Cancel",
    maxFiles: "Max 6 files",
    errorType: "Invalid file type",
    errorSize: "File exceeds 5MB",
    addMoreHint: "Drag & drop or click to add more photos (max 6)",
  },
  actions: {
    postService: "Post Service",
    cancel: "Clear Form",
    next: "Next",
    back: "Back",
    reviewPost: "Review Post",
  },
  categories: [
    "Plumbing",
    "Electricity",
    "Locksmith",
    "Cleaning",
    "Painting",
    "Carpentry",
    "Air Conditioning",
    "Pest Control",
    "Moving",
    "Other",
  ],
  validation: {
    titleRequired: "Please enter a title for your request.",
    titleUnsafe: "The title contains characters that aren't allowed (< or >).",
    categoryRequired: "Please select a service category.",
    categoriesUnavailable:
      "Couldn't load categories. Please try again later.",
    descriptionRequired: "Please add a description.",
    descriptionUnsafe:
      "The description contains characters that aren't allowed (< or >).",
    locationRequired: "Please enter a location.",
    locationNotResolved:
      "Press Enter to locate your neighborhood, or use your current location.",
    budgetInvalid: "Enter a valid budget (greater than 0, max 2 decimals).",
  },
  errors: {
    locationNotFound: "That location wasn't found. Try being more specific.",
    geolocationDenied: "We couldn't access your location. Check permissions.",
    geolocationUnsupported: "Your browser doesn't support geolocation.",
    photoTooLarge: "is over 5MB and wasn't added.",
    submitFailed: "Couldn't post the service. Please try again.",
  },
  success: {
    posted: "Service posted successfully!",
  },
};
