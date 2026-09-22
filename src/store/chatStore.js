import { useSyncExternalStore } from "react";

let state = {
  messages: [],
  isLoading: false,
  error: null,
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

export function addMessage(message) {
  setState({
    messages: [...state.messages, message],
  });
}

export function setChatLoading(isLoading) {
  setState({
    isLoading,
  });
}

export function setChatError(error) {
  setState({
    error,
  });
}

export function clearChat() {
  setState({
    messages: [],
    isLoading: false,
    error: null,
  });
}

export function useChatStore() {
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