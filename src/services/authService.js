const API_URL = "http://127.0.0.1:8000";

const SESSION_KEY = "researchai-session";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.detail || "Something went wrong. Please try again."
    );
  }

  return data;
}


// --------------------------------
// SIGNUP
// --------------------------------

export async function signup({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const data = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: name.trim(),
      email: normalizedEmail,
      password,
    }),
  });

  // IMPORTANT:
  // Do NOT create a logged-in session here.
  // The user still needs to verify the OTP.

  return {
    email: data.email || normalizedEmail,
    message: data.message,
  };
}


// --------------------------------
// VERIFY EMAIL OTP
// --------------------------------

export async function verifyOTP({ email, otp }) {
  const normalizedEmail = email.trim().toLowerCase();

  const data = await request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      email: normalizedEmail,
      otp: otp.trim(),
    }),
  });

  const user = data.user;

  if (user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
  }

  return user;
}


// --------------------------------
// RESEND OTP
// --------------------------------

export async function resendOTP({ email }) {
  const normalizedEmail = email.trim().toLowerCase();

  const data = await request("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({
      email: normalizedEmail,
    }),
  });

  return data;
}


// --------------------------------
// LOGIN
// --------------------------------

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: normalizedEmail,
      password,
    }),
  });

  const user = data.user;

  if (user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
  }

  return user;
}


// --------------------------------
// UPDATE PROFILE
// --------------------------------

export async function updateProfile({ id, name, email }) {
  const data = await request("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    }),
  });

  const user = data.user;

  if (user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
  }

  return user;
}


// --------------------------------
// LOGOUT
// --------------------------------

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}


// --------------------------------
// CURRENT USER
// --------------------------------

export function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY)
    ) || null;
  } catch {
    return null;
  }
}


// --------------------------------
// AUTH CHECK
// --------------------------------

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}