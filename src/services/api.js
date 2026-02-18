// Use the Vite proxy path so all requests go through localhost:3000/api → localhost:3001
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/mukfin/api`

// ─── Attendance API ───────────────────────────────────────────────

export const getAttendance = async () => {
  const response = await fetch(`${API_BASE_URL}/attendance`);
  if (!response.ok) {
    throw new Error("Failed to fetch attendance records");
  }
  return response.json();
};

// Fetch attendance filtered by userId (for employees viewing their own records)
export const getAttendanceByUserId = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/attendance/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch attendance records");
  }
  return response.json();
};

export const getAttendanceByName = async (name) => {
  const response = await fetch(`${API_BASE_URL}/attendanceByName/${name}`);
  if (!response.ok) {
    throw new Error("Failed to fetch attendance records");
  }
  return response.json();
};

export const createAttendance = async (record) => {

  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });
  if (!response.ok) {
    throw new Error("Failed to create attendance record");
  }
  return response.json();
};

export const updateAttendance = async (id, updates) => {
  const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error("Failed to update attendance record");
  }
  return response.json();
};

export const findTodayRecord = async (name, date) => {
  const response = await fetch(
    `${API_BASE_URL}/attendanceByNameAndDate/${name}/${date}`,
  );
  if (!response.ok) {
    throw new Error("Failed to find attendance record");
  }
  const records = (await response.json()).data;
  return records.length > 0 ? records[0] : null;
};

// ─── User / Auth API ──────────────────────────────────────────────

// Sign up – create a new user. Returns the created user object.
export const registerUser = async (userData) => {
  // Check if email already exists
  const check = await fetch(`${API_BASE_URL}/users/${userData.email}`);
  const existing = await check.json();
  if (existing.length > 0) {
    throw new Error("Email already registered");
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error("Failed to register user");
  }
  return response.json();
};

// Sign in – find user by email & password. Returns user or throws.
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/loginUser`, {
    method: "POST",
     headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, password: password }),
  });
  if (!response.ok) {
    throw new Error("Failed to sign in");
  }
  const users = await response.json();

  if (users.data.length === 0) {
    throw new Error("Invalid email or password");
  }
  return users.data[0];
};

// Fetch all users (used by managers/HR to resolve department members)
export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

// ─── Leave Requests API ──────────────────────────────────────────

// Get leave requests for a specific user (employee view)
export const getLeaveRequestsByUserId = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/leaveRequest/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch leave requests");
  }
  return response.json();
};

// Get leave requests filtered by department (manager view)
export const getLeaveRequestsByDepartment = async (department) => {
  const response = await fetch(
    `${API_BASE_URL}/leaveRequestDepartment/${department}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch leave requests");
  }
  return response.json();
};

// Get all leave requests (HR view)
export const getAllLeaveRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/leaveRequest`);
  if (!response.ok) {
    throw new Error("Failed to fetch leave requests");
  }
  return response.json();
};

// Submit a new leave request (employee action)
export const createLeaveRequest = async (request) => {
  const response = await fetch(`${API_BASE_URL}/leaveRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error("Failed to submit leave request");
  }
  return response.json();
};

// Update a leave request (manager/HR approval or rejection)
export const updateLeaveRequest = async (id, updates) => {
  const response = await fetch(`${API_BASE_URL}/leaveRequest/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error("Failed to update leave request");
  }
  return response.json();
};
