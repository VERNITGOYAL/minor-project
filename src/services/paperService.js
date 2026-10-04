import { apiFetch } from "./apiClient";

const ACCESS_TOKEN_KEY = "researchai-access-token";
const analysisRequests = new Map();

function authHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response, fallback) {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem("researchai-session");
      window.dispatchEvent(new CustomEvent("researchai:auth-expired"));
    }
    throw new Error(data.detail || fallback);
  }

  return data;
}

export async function getPapers() {
  const response = await apiFetch("/api/papers", {
    headers: authHeaders(),
  });
  const data = await parseResponse(response, "Unable to load papers.");
  return data.papers;
}

export async function getPaperChunks(id) {
  const response = await apiFetch(`/api/papers/${id}/chunks`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response, "Unable to prepare paper chunks.");
  return data.chunks;
}

export function analyzePaper(id) {
  if (!analysisRequests.has(id)) {
    const request = apiFetch(`/api/papers/${id}/analyze`, {
      method: "POST",
      headers: authHeaders(),
    }).then((response) => parseResponse(response, "Unable to analyze paper."));

    analysisRequests.set(id, request);
    const clearRequest = () => {
      if (analysisRequests.get(id) === request) {
        analysisRequests.delete(id);
      }
    };
    request.then(clearRequest, clearRequest);
  }

  return analysisRequests.get(id);
}

export async function uploadPaper(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/papers/upload", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const data = await parseResponse(response, "Unable to upload paper.");
  return data.paper;
}

export async function removePaper(id) {
  const response = await apiFetch(`/api/papers/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  await parseResponse(response, "Unable to delete paper.");
  return id;
}

export async function openPaper(id) {
  const response = await apiFetch(`/api/papers/${id}/file`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Unable to open paper.");
  }

  const blobUrl = URL.createObjectURL(await response.blob());
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}