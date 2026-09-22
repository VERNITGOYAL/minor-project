import { useSyncExternalStore } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  login as loginService,
  signup as signupService,
  logout as logoutService,
} from "../services/authService";

let state = {
  user: getCurrentUser(),
  isAuthenticated: isAuthenticated(),
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

export async function login(credentials) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const user = loginService(credentials);

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

export async function signup(userData) {
  setState({
    isLoading: true,
    error: "",
  });

  try {
    const user = signupService(userData);

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

export function logout() {
  logoutService();

  setState({
    user: null,
    isAuthenticated: false,
    error: "",
  });
}

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