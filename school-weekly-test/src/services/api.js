const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
};

const requestForm = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
};

export const api = {
  getTests: () => request("/tests"),
  createTest: (payload) =>
    request("/tests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTestStatus: (id, status) =>
    request(`/tests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getQuestions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/questions${qs ? `?${qs}` : ""}`);
  },
  createQuestion: (payload) =>
    request("/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateQuestion: (id, payload) =>
    request(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteQuestion: (id) =>
    request(`/questions/${id}`, {
      method: "DELETE",
    }),
  getResults: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/results${qs ? `?${qs}` : ""}`);
  },
  getStudents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/students${qs ? `?${qs}` : ""}`);
  },
  createStudent: (payload) =>
    request("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStudent: (id, payload) =>
    request(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteStudent: (id) =>
    request(`/students/${id}`, {
      method: "DELETE",
    }),
  createResult: (payload) =>
    request("/results", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return requestForm("/uploads", formData);
  },
  getStudyMaterials: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/study-materials${qs ? `?${qs}` : ""}`);
  },
  createStudyMaterial: (formData) => requestForm("/study-materials", formData),
};
