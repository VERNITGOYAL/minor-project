const PAPERS_KEY = "researchai-papers";

function getStoredPapers() {
  try {
    return JSON.parse(localStorage.getItem(PAPERS_KEY)) || [];
  } catch {
    return [];
  }
}

function savePapers(papers) {
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
}

export function getPapers() {
  return getStoredPapers();
}

export function addPaper(paper) {
  const papers = getStoredPapers();

  const newPaper = {
    id: crypto.randomUUID(),
    ...paper,
    createdAt: new Date().toISOString(),
  };

  savePapers([...papers, newPaper]);

  return newPaper;
}

export function removePaper(id) {
  const papers = getStoredPapers();
  const updatedPapers = papers.filter((paper) => paper.id !== id);

  savePapers(updatedPapers);

  return updatedPapers;
}

export function clearPapers() {
  localStorage.removeItem(PAPERS_KEY);
}