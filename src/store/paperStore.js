import { useSyncExternalStore } from "react";
import {
  getPapers,
  removePaper,
  uploadPaper,
} from "../services/paperService";

let state = {
  papers: [],
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

export async function loadPapers() {
  const papers = await getPapers();
  setState({ papers });
  return papers;
}

export async function addPaperToStore(file) {
  const newPaper = await uploadPaper(file);
  setState({ papers: [newPaper, ...state.papers] });
  return newPaper;
}

export async function removePaperFromStore(id) {
  await removePaper(id);
  setState({
    papers: state.papers.filter((paper) => paper.id !== id),
    selectedPaper: state.selectedPaper?.id === id ? null : state.selectedPaper,
  });
}

export async function clearAllPapers() {
  await Promise.all(state.papers.map((paper) => removePaper(paper.id)));
  setState({ papers: [], selectedPaper: null });
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