import { useSyncExternalStore } from "react";
import {
  getPapers,
  addPaper,
  removePaper,
  clearPapers,
} from "../services/paperService";

let state = {
  papers: getPapers(),
  selectedPaper: null,
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

export function addPaperToStore(paper) {
  const newPaper = addPaper(paper);

  setState({
    papers: [...state.papers, newPaper],
  });

  return newPaper;
}

export function removePaperFromStore(id) {
  const updatedPapers = removePaper(id);

  setState({
    papers: updatedPapers,
    selectedPaper:
      state.selectedPaper?.id === id
        ? null
        : state.selectedPaper,
  });
}

export function clearAllPapers() {
  clearPapers();

  setState({
    papers: [],
    selectedPaper: null,
  });
}

export function selectPaper(paper) {
  setState({
    selectedPaper: paper,
  });
}

export function usePaperStore() {
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