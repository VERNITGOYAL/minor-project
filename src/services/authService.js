const USERS_KEY = "researchai-users";
const SESSION_KEY = "researchai-session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signup({ name, email, password }) {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email === normalizedEmail
  );

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
  };

  saveUsers([...users, user]);

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
}

export function login({ email, password }) {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user) throw new Error("No account exists for this email. Create an account first.");
  if (user.password !== password) throw new Error("Incorrect password. Try again or create a new account.");

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}