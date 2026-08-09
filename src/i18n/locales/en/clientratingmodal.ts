export const clientratingmodal = {
  title: "Rate Your Experience",
  subtitle: "Your service was marked as completed. Share your feedback about the provider.",
  completed: "Completed",
  selectRating: "SELECT YOUR RATING",
  shareExperience: "PICK A COMMENT (OPTIONAL)",
  submit: "Submit Rating",
  submitting: "Submitting...",
  success: "Thanks for your rating!",
  error: "Couldn't submit your rating. Please try again.",
  messagesByRating: {
    5: [
      "Excellent service, exceeded my expectations",
      "Very professional and punctual",
      "Great quality work, I recommend it",
    ],
    4: [
      "Good service, delivered as agreed",
      "Professional and reliable",
      "I was satisfied with the result",
    ],
    3: [
      "The service covered the basics",
      "Could improve in some areas",
      "Acceptable result",
    ],
    2: [
      "The service didn't meet my expectations",
      "There were communication issues",
      "The work wasn't as agreed",
    ],
    1: [
      "Very bad experience",
      "Didn't deliver what was promised",
      "I don't recommend it",
    ],
  } as Record<number, string[]>,
};
