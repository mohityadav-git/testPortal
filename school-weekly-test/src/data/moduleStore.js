const STORAGE_KEY = "schoolModuleData";

export const moduleConfigs = {
  syllabus: {
    title: "Syllabus",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "subject", label: "Subject", required: true },
      { key: "className", label: "Class/Section" },
      { key: "url", label: "File or Link", placeholder: "https://..." },
      { key: "note", label: "Notes" },
    ],
  },
  datesheet: {
    title: "Datesheet",
    fields: [
      { key: "title", label: "Exam / Test", required: true },
      { key: "className", label: "Class/Section", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "time", label: "Time", type: "time" },
      { key: "venue", label: "Venue / Link" },
    ],
  },
  attendance: {
    title: "Attendance",
    fields: [
      { key: "className", label: "Class/Section", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "present", label: "Present Count" },
      { key: "absent", label: "Absent Count" },
      { key: "note", label: "Notes" },
    ],
  },
  prayers: {
    title: "Thoughts & Prayers",
    fields: [
      { key: "title", label: "Heading", required: true },
      { key: "note", label: "Message", required: true },
      { key: "date", label: "Publish Date", type: "date" },
    ],
  },
  homework: {
    title: "Homework",
    fields: [
      { key: "title", label: "Task", required: true },
      { key: "subject", label: "Subject", required: true },
      { key: "className", label: "Class/Section", required: true },
      { key: "dueDate", label: "Due Date", type: "date" },
      { key: "note", label: "Details" },
    ],
  },
  assignments: {
    title: "Home Assignment/Exams",
    fields: [
      { key: "title", label: "Assignment", required: true },
      { key: "subject", label: "Subject", required: true },
      { key: "className", label: "Class/Section", required: true },
      { key: "dueDate", label: "Due Date", type: "date" },
      { key: "note", label: "Details" },
    ],
  },
  liveClass: {
    title: "Live/Recorded Classes",
    fields: [
      { key: "title", label: "Session", required: true },
      { key: "subject", label: "Subject" },
      { key: "className", label: "Class/Section" },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "url", label: "Link / Recording" },
    ],
  },
  results: {
    title: "Exam Result",
    fields: [
      { key: "title", label: "Exam", required: true },
      { key: "className", label: "Class/Section" },
      { key: "score", label: "Score" },
      { key: "outOf", label: "Out of" },
      { key: "note", label: "Remarks" },
    ],
  },
  downloads: {
    title: "Downloads",
    fields: [
      { key: "title", label: "Resource", required: true },
      { key: "subject", label: "Subject" },
      { key: "className", label: "Class/Section" },
      { key: "url", label: "File or Link", placeholder: "https://..." },
      { key: "note", label: "Notes" },
    ],
  },
  allDownloads: {
    title: "All Downloads",
    targetKey: "downloads",
    fields: [],
  },
  chat: {
    title: "Live Chat",
    fields: [
      { key: "title", label: "Channel / Topic", required: true },
      { key: "note", label: "Message", required: true },
    ],
  },
  schedule: {
    title: "My Schedule",
    fields: [
      { key: "title", label: "Item", required: true },
      { key: "className", label: "Class/Section" },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "note", label: "Details" },
    ],
  },
  fee: {
    title: "Fee",
    fields: [
      { key: "title", label: "Fee Title", required: true },
      { key: "className", label: "Class/Section" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Paid", "Overdue"] },
      { key: "dueDate", label: "Due Date", type: "date" },
    ],
  },
  galleryPhoto: {
    title: "School Photo Gallery",
    fields: [
      { key: "title", label: "Album", required: true },
      { key: "url", label: "Image Link", required: true, placeholder: "https://..." },
      { key: "note", label: "Caption" },
    ],
  },
  galleryVideo: {
    title: "School Video Gallery",
    fields: [
      { key: "title", label: "Video", required: true },
      { key: "url", label: "Video Link", required: true, placeholder: "https://..." },
      { key: "note", label: "Description" },
    ],
  },
  leave: {
    title: "Apply Leave",
    fields: [
      { key: "title", label: "Reason", required: true },
      { key: "fromDate", label: "From", type: "date", required: true },
      { key: "toDate", label: "To", type: "date", required: true },
      { key: "note", label: "Notes" },
    ],
  },
  news: {
    title: "News Paper Gallery",
    fields: [
      { key: "title", label: "Headline", required: true },
      { key: "date", label: "Date", type: "date" },
      { key: "url", label: "Link / PDF" },
      { key: "note", label: "Summary" },
    ],
  },
  achievements: {
    title: "Achievements",
    fields: [
      { key: "title", label: "Achievement", required: true },
      { key: "className", label: "Class/Section" },
      { key: "student", label: "Student / Team" },
      { key: "note", label: "Details" },
    ],
  },
  almanac: {
    title: "Almanac",
    fields: [
      { key: "title", label: "Event", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "note", label: "Notes" },
    ],
  },
};

export const defaultModuleData = {
  syllabus: [
    {
      id: "sy1",
      title: "Mathematics Term 1",
      subject: "Mathematics",
      className: "Class 5",
      url: "https://example.com/syllabus-math.pdf",
      note: "Updated this week",
    },
  ],
  datesheet: [
    {
      id: "dt1",
      title: "Weekly Test Round 1",
      className: "Class 5",
      date: "2025-12-20",
      time: "09:00",
      venue: "Room 12",
    },
  ],
  attendance: [
    {
      id: "att1",
      className: "Class 5",
      date: "2025-12-15",
      present: 28,
      absent: 2,
      note: "2 students on medical leave",
    },
    {
      id: "att2",
      className: "Class 8",
      date: "2025-12-15",
      present: 30,
      absent: 0,
      note: "Perfect attendance",
    },
  ],
  prayers: [
    {
      id: "pr1",
      title: "Gratitude Monday",
      note: "Start the week with a kind note to someone who helped you.",
      date: "2025-12-15",
    },
  ],
  homework: [
    {
      id: "hw1",
      title: "Fractions worksheet",
      subject: "Mathematics",
      className: "Class 5",
      dueDate: "2025-12-21",
      note: "Complete Q1-Q5",
    },
  ],
  assignments: [
    {
      id: "as1",
      title: "Science Project Outline",
      subject: "Science",
      className: "Class 7",
      dueDate: "2025-12-28",
      note: "Submit a one-page outline for the solar system model.",
    },
  ],
  liveClass: [
    {
      id: "lc1",
      title: "Science Revision",
      subject: "Science",
      className: "Class 5",
      date: "2025-12-19",
      time: "17:00",
      url: "https://meet.example.com/revision",
    },
  ],
  results: [
    {
      id: "res1",
      title: "Math Weekly Test",
      className: "Class 5",
      score: "18",
      outOf: "20",
      note: "Great improvement",
    },
  ],
  downloads: [
    {
      id: "dl1",
      title: "Science diagrams pack",
      subject: "Science",
      className: "Class 5",
      url: "https://example.com/diagrams.zip",
      note: "Use for lab prep",
    },
  ],
  chat: [
    {
      id: "ch1",
      title: "Class 5 Updates",
      note: "Reminder: bring math notebooks tomorrow.",
      createdAt: "2025-12-15T10:00:00Z",
    },
  ],
  schedule: [
    {
      id: "sc1",
      title: "PTM slot booking",
      date: "2025-12-22",
      time: "14:00",
      note: "Parents invited",
    },
  ],
  fee: [
    {
      id: "fee1",
      title: "Term 2 Fee",
      className: "Class 5",
      amount: "2500",
      status: "Pending",
      dueDate: "2025-12-30",
    },
  ],
  galleryPhoto: [
    {
      id: "gp1",
      title: "Sports Day Highlights",
      url: "https://example.com/photo-sports.jpg",
      note: "Relay race winners",
    },
  ],
  galleryVideo: [
    {
      id: "gv1",
      title: "Annual Day Performance",
      url: "https://example.com/annual-day.mp4",
      note: "Grade 5 group song",
    },
  ],
  leave: [
    {
      id: "lv1",
      title: "Medical Leave",
      fromDate: "2025-12-18",
      toDate: "2025-12-20",
      note: "Doctor appointment",
    },
  ],
  news: [
    {
      id: "nw1",
      title: "Inter-school Quiz Winners",
      date: "2025-12-14",
      url: "https://example.com/quiz-news",
      note: "Class 8 team secured 1st place.",
    },
  ],
  achievements: [
    {
      id: "ac1",
      title: "Math Olympiad Gold",
      className: "Class 9",
      student: "Riya Sharma",
      note: "State-level topper",
    },
  ],
  almanac: [
    {
      id: "al1",
      title: "Winter break",
      date: "2025-12-24",
      note: "School closed",
    },
  ],
};

export const resolveModuleKey = (key) => moduleConfigs[key]?.targetKey || key;

export const loadModuleData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultModuleData;
    const parsed = JSON.parse(stored);
    return { ...defaultModuleData, ...parsed };
  } catch (err) {
    return defaultModuleData;
  }
};

export const saveModuleData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    // ignore write errors
  }
};
