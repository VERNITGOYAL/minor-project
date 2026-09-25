const API_URL = "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "researchai-access-token";

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
  const response = await fetch(`${API_URL}/api/papers`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response, "Unable to load papers.");
  return data.papers;
}

export async function uploadPaper(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/papers/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const data = await parseResponse(response, "Unable to upload paper.");
  return data.paper;
}

export async function removePaper(id) {
  const response = await fetch(`${API_URL}/api/papers/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  await parseResponse(response, "Unable to delete paper.");
  return id;
}

export async function openPaper(id) {
  const response = await fetch(`${API_URL}/api/papers/${id}/file`, {
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