const subjectOptions = [
  "All Subjects",
  "Mathematics",
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Zoology",
  "English",
  "English Grammer",
  "English Language",
  "Home Science",
  "Social Studies",
  "Computer Science",
  "Computer",
  "History",
  "Geography",
  "Economics",
  "Hindi",
  "Reasoning",
  "Physical Education",
  "Environment",
  "Political Science",
  "Current Affairs",
  "Commerce",
  "Sanskrit",
  "Physiology",
  "Art",
  "Education",
  "Diffence",
  "Technical",
  "Artificial Inteligence",
  "Entrepreneours",
];

const classOptions = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const difficultyOptions = ["Easy", "Medium", "Hard"];

const questionPickingOptions = [
  { label: "Random", value: "random" },
  { label: "Manual", value: "manual" },
];

const buildDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;
  const built = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(built.getTime())) return null;
  return built;
};

export {
  subjectOptions,
  classOptions,
  difficultyOptions,
  questionPickingOptions,
  buildDateTime,
};
