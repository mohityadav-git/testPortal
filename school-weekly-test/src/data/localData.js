// Centralized local sample data and helpers

export const classOptions = [
  { name: "Class 1", tag: "1", color: "#59c27f", desc: "Basics of numbers, phonics, reading short stories, and shapes." },
  { name: "Class 2", tag: "2", color: "#4ca1d3", desc: "Two-digit arithmetic, simple grammar, and sentence building." },
  { name: "Class 3", tag: "3", color: "#f2a457", desc: "Measurement, possessives, conjunctions, and dictionary skills." },
  { name: "Class 4", tag: "4", color: "#9d6acb", desc: "Fractions, time, synonyms/antonyms, and homophones." },
  { name: "Class 5", tag: "5", color: "#3fb28a", desc: "Fractions, angles, prepositions, homographs, and compounds." },
  { name: "Class 6", tag: "6", color: "#d9903f", desc: "Multiples, fractions, prefixes/suffixes, complex sentences." },
  { name: "Class 7", tag: "7", color: "#3e9c7a", desc: "Rational numbers, clauses, connotations, and hyphens." },
  { name: "Class 8", tag: "8", color: "#5fa8d3", desc: "Linear equations, exponents, formal writing, and vocab." },
  { name: "Class 9", tag: "9", color: "#d36c5c", desc: "Polynomials, coordinate geometry, fiction analysis, grammar." },
  { name: "Class 10", tag: "10", color: "#5bbd8a", desc: "Trigonometry basics, statistics, essays, and literature themes." },
  { name: "Class 11", tag: "11", color: "#c482f2", desc: "Algebra, limits intro, advanced comprehension, report writing." },
  { name: "Class 12", tag: "12", color: "#f29d52", desc: "Calculus basics, probability, critical essays, and summaries." },
];

export const subjectOptions = [
  { name: "Mathematics", color: "#59c27f", desc: "Numbers, algebra, geometry, and problem solving." },
  { name: "Science", color: "#4ca1d3", desc: "Physics, chemistry, biology basics, and experiments." },
  { name: "English", color: "#f2a457", desc: "Reading, grammar, writing, and comprehension." },
  { name: "Social Studies", color: "#9d6acb", desc: "History, civics, geography, culture." },
  { name: "Physics", color: "#5fa8d3", desc: "Mechanics, electricity, waves, and modern physics." },
  { name: "Chemistry", color: "#d36c5c", desc: "Atoms, reactions, organic basics, and lab skills." },
  { name: "Biology", color: "#3fb28a", desc: "Cells, plants, animals, genetics, and health." },
  { name: "Computer Science", color: "#d9903f", desc: "Programming basics, logic, and computing concepts." },
  { name: "History", color: "#c482f2", desc: "Civilizations, events, timelines, and analysis." },
  { name: "Geography", color: "#5bbd8a", desc: "Maps, climates, resources, and regions." },
  { name: "Economics", color: "#f29d52", desc: "Markets, money, trade, and basic finance." },
  { name: "Hindi", color: "#3e9c7a", desc: "Literature, grammar, and composition." },
];

export const initialTests = [
  {
    id: "T1",
    subject: "Mathematics",
    className: "Class 3",
    date: "2025-12-10",
    time: "09:00",
    durationMinutes: 30,
    status: "Scheduled",
  },
  {
    id: "T2",
    subject: "Science",
    className: "Class 5",
    date: "2025-12-12",
    time: "11:00",
    durationMinutes: 40,
    status: "Scheduled",
  },
];

// Student dashboard sample tests
export const studentMockTests = [
  {
    id: "T1",
    subject: "Mathematics",
    className: "8A",
    date: "2025-12-10",
    time: "09:00",
    durationMinutes: 30,
    status: "Scheduled",
  },
  {
    id: "T2",
    subject: "Science",
    className: "8A",
    date: "2025-12-05",
    time: "10:00",
    durationMinutes: 40,
    status: "Completed",
    score: 18,
    outOf: 20,
  },
  {
    id: "T3",
    subject: "English",
    className: "8A",
    date: "2025-11-28",
    time: "11:00",
    durationMinutes: 30,
    status: "Completed",
    score: 15,
    outOf: 20,
  },
];

// Test attempt fallback questions
export const fallbackQuestions = [];

// Large demo set to quickly seed UIs with plenty of questions
export const demoHundredQuestions = Array.from({ length: 100 }, (_, idx) => {
  const base = idx + 1;
  return { id: `HQ${base}`, subject: "", className: "", difficulty: "", question: "", options: [], correctIndex: 0 };
});

const subjectQuestionTemplates = {
  Mathematics: (idx) => {
    const a = 3 + (idx % 10);
    const b = 2 + (idx % 7);
    return {
      question: `Mathematics: What is ${a} + ${b}?`,
      options: [
        { text: `${a + b}`, imageUrl: null },
        { text: `${a + b + 1}`, imageUrl: null },
        { text: `${a + b - 1}`, imageUrl: null },
        { text: `${a + b + 2}`, imageUrl: null },
      ],
      correctIndex: 0,
    };
  },
  Science: (idx) => {
    const templates = [
      {
        question: "Science: Which gas do plants absorb for photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
        correctIndex: 2,
      },
      {
        question: "Science: Which part of the plant conducts photosynthesis?",
        options: ["Roots", "Stem", "Leaves", "Flowers"],
        correctIndex: 2,
      },
      {
        question: "Science: What is the boiling point of water at sea level?",
        options: ["50°C", "100°C", "150°C", "200°C"],
        correctIndex: 1,
      },
      {
        question: "Science: What is the center of an atom called?",
        options: ["Electron", "Nucleus", "Proton", "Neutron"],
        correctIndex: 1,
      },
    ];
    return templates[idx % templates.length];
  },
  English: (idx) => {
    const templates = [
      {
        question: "English: Choose the synonym for 'rapid'.",
        options: ["Slow", "Quick", "Lazy", "Late"],
        correctIndex: 1,
      },
      {
        question: "English: Identify the noun in the sentence 'The cat slept on the mat.'",
        options: ["slept", "cat", "on", "the"],
        correctIndex: 1,
      },
      {
        question: "English: What is the plural of 'child'?",
        options: ["Childs", "Childes", "Children", "Childrens"],
        correctIndex: 2,
      },
    ];
    return templates[idx % templates.length];
  },
  "Social Studies": (idx) => {
    const templates = [
      {
        question: "Social Studies: Which river is known as the lifeline of Egypt?",
        options: ["Ganges", "Nile", "Amazon", "Yangtze"],
        correctIndex: 1,
      },
      {
        question: "Social Studies: Who was the first President of India?",
        options: ["Mahatma Gandhi", "Dr. Rajendra Prasad", "Jawaharlal Nehru", "Sardar Patel"],
        correctIndex: 1,
      },
      {
        question: "Social Studies: The Great Wall is in which country?",
        options: ["India", "China", "Japan", "Russia"],
        correctIndex: 1,
      },
    ];
    return templates[idx % templates.length];
  },
  "Computer Science": (idx) => {
    const templates = [
      {
        question: "Computer Science: What does 'CPU' stand for?",
        options: [
          "Central Processing Unit",
          "Computer Processing Utility",
          "Central Program Unit",
          "Control Processing Utility",
        ],
        correctIndex: 0,
      },
      {
        question: "Computer Science: Which language is used for styling web pages?",
        options: ["HTML", "CSS", "Python", "SQL"],
        correctIndex: 1,
      },
      {
        question: "Computer Science: Which of these is an input device?",
        options: ["Monitor", "Printer", "Keyboard", "Speaker"],
        correctIndex: 2,
      },
    ];
    return templates[idx % templates.length];
  },
  Hindi: (idx) => {
    const templates = [
      {
        question: "Hindi: 'नदी' का अंग्रेजी शब्द क्या है?",
        options: ["River", "Hill", "Forest", "Cloud"],
        correctIndex: 0,
      },
      {
        question: "Hindi: 'सुंदर' का पर्यायवाची शब्द चुनें।",
        options: ["कुरूप", "शांत", "खूबसूरत", "धीमा"],
        correctIndex: 2,
      },
      {
        question: "Hindi: 'लड़का' का बहुवचन क्या है?",
        options: ["लड़की", "लड़कियां", "लड़के", "लड़कों"],
        correctIndex: 2,
      },
    ];
    return templates[idx % templates.length];
  },
};

const buildSampleQuestion = (subject, className, idx) => {
  const generator = subjectQuestionTemplates[subject] || subjectQuestionTemplates.Mathematics;
  const template = generator(idx);
  return {
    id: `Q${idx + 1}`,
    question: `${template.question} (${className})`,
    options: template.options,
    correctIndex: template.correctIndex,
  };
};

export const buildInitialQuestionBank = () => {
  return {};
};

export const normalizeBank = (raw) => {
  if (!raw) return {};
  if (Array.isArray(raw)) return { All: raw };
  const result = {};
  Object.entries(raw).forEach(([subj, val]) => {
    if (Array.isArray(val)) {
      result[subj] = { All: val };
    } else if (val && typeof val === "object") {
      result[subj] = val;
    }
  });
  return result;
};

export const hasBankData = (bank) =>
  Object.keys(bank).some((subj) => bank[subj] && Object.keys(bank[subj]).length > 0);

