import { useSyncExternalStore } from "react";

const API_URL = "http://127.0.0.1:8000";

const SESSION_KEY = "researchai-session";
export const ACCESS_TOKEN_KEY = "researchai-access-token";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

let state = {
  user: getCurrentUser(),
  isAuthenticated: Boolean(
    getCurrentUser() && localStorage.getItem(ACCESS_TOKEN_KEY)
  ),
  isLoading: false,
  error: "",
};

const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(nextState) {
  state = {
    ...state,
    ...nextState,
  };

  emit();
}

// --------------------------------
// LOGIN
// --------------------------------

export async function login(credentials) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to login."
      );
    }

    const user = data.user;

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: "",
    });

    return user;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

// --------------------------------
// GOOGLE LOGIN
// --------------------------------

export async function loginWithGoogle(credential) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to login with Google."
      );
    }

    const user = data.user;

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: "",
    });

    return user;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

export async function updateProfile(profileData) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to update profile."
      );
    }

    // Email has NOT changed yet.
    // Backend is waiting for OTP.
    if (data.email_changed) {
      setState({
        isLoading: false,
        error: "",
      });

      return data;
    }

    const user = data.user;

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: "",
    });

    return user;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

export async function verifyEmailChange({
  userId,
  newEmail,
  otp,
}) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(
      `${API_URL}/auth/change-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          new_email: newEmail,
          otp,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to verify new email."
      );
    }

    const user = data.user;

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: "",
    });

    return user;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

export async function requestPasswordReset(email) {
  const response = await fetch(`${API_URL}/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to send password reset code.");
  }

  return data;
}

export async function resetPassword({ email, otp, password }) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unable to reset password.");
  }

  return data;
}

// --------------------------------
// SIGNUP
// --------------------------------

export async function signup(userData) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to create your account."
      );
    }

    setState({
      isLoading: false,
      error: "",
    });

    // IMPORTANT:
    // Do NOT authenticate the user yet.
    // Email still needs OTP verification.

    return data;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

// --------------------------------
// VERIFY OTP
// --------------------------------

export async function verifyOTP({ email, otp }) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to verify OTP."
      );
    }

    const user = data.user;

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: "",
    });

    return user;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

// --------------------------------
// RESEND OTP
// --------------------------------

export async function resendOTP(email) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const response = await fetch(
      `${API_URL}/auth/resend-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to resend OTP."
      );
    }

    setState({
      isLoading: false,
      error: "",
    });

    return data;
  } catch (error) {
    setState({
      isLoading: false,
      error: error.message,
    });

    throw error;
  }
}

// --------------------------------
// LOGOUT
// --------------------------------

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);

  setState({
    user: null,
    isAuthenticated: false,
    error: "",
  });
}

// --------------------------------
// AUTH STORE
// --------------------------------

export function useAuthStore() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
    () => state
  );
}

export function clearStaleSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  setState({
    user: null,
    isAuthenticated: false,
    error: "",
  });
}