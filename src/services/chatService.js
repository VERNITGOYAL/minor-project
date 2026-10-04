import { apiFetch } from "./apiClient";
import { getPaperChunks } from "./paperService";
import {
  deletePaperChunkCache,
  getPaperChunkCache,
  savePaperChunkCache,
} from "./paperChunkDatabase";

const ACCESS_TOKEN_KEY = "researchai-access-token";
const EMBEDDING_SIZE = 384;

function authHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response, fallback) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || fallback);
  }
  return data;
}

export async function getConversations() {
  const response = await apiFetch("/api/chat/conversations", {
    headers: authHeaders(),
  });
  const data = await parseResponse(response, "Unable to load chat history.");
  return data.conversations;
}

export async function getConversationMessages(conversationId) {
  const response = await apiFetch(
    `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    { headers: authHeaders() }
  );
  const data = await parseResponse(response, "Unable to load this chat.");
  return data.messages;
}

export async function getCachedPaperChunks(userId, paper) {
  const cached = await getPaperChunkCache(userId, paper.id);
  if (
    cached?.chunks?.length &&
    cached.chunks.every(
      (chunk) =>
        chunk &&
        typeof chunk.text === "string" &&
        chunk.metadata?.paper_id === paper.id &&
        typeof chunk.metadata.title === "string" &&
        Number.isInteger(chunk.metadata.page) &&
        Array.isArray(chunk.embedding) &&
        chunk.embedding.length === EMBEDDING_SIZE &&
        chunk.embedding.every(Number.isFinite)
    )
  ) {
    return cached.chunks;
  }

  if (cached) {
    await deletePaperChunkCache(paper.id);
  }

  const chunks = await getPaperChunks(paper.id);
  if (!chunks.length) {
    throw new Error(`No readable chunks were found in ${paper.title}.`);
  }
  await savePaperChunkCache(userId, paper.id, chunks);
  return chunks;
}

export async function getQueryEmbedding(message) {
  const response = await apiFetch("/api/chat/query-embedding", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await parseResponse(response, "Unable to prepare paper search.");
  if (
    !Array.isArray(data.embedding) ||
    data.embedding.length !== EMBEDDING_SIZE ||
    !data.embedding.every(Number.isFinite)
  ) {
    throw new Error("The server returned an invalid search embedding.");
  }
  return data.embedding;
}

export function selectRelevantChunks(queryEmbedding, chunks, limit = 5) {
  const queryMagnitude = Math.sqrt(
    queryEmbedding.reduce((sum, value) => sum + value * value, 0)
  );
  if (!queryMagnitude || queryEmbedding.length !== EMBEDDING_SIZE) {
    throw new Error("The search embedding is invalid.");
  }

  return chunks
    .map((chunk) => {
      const embedding = chunk.embedding;
      const magnitude = Math.sqrt(
        embedding.reduce((sum, value) => sum + value * value, 0)
      );
      const dotProduct = embedding.reduce(
        (sum, value, index) => sum + value * queryEmbedding[index],
        0
      );
      return {
        chunk,
        score: magnitude ? dotProduct / (magnitude * queryMagnitude) : -1,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ chunk }) => ({
      paper_id: chunk.metadata.paper_id,
      title: chunk.metadata.title,
      page: chunk.metadata.page,
      text: chunk.text,
    }));
}

export async function sendChatMessage({
  message,
  conversationId = null,
  paperId = null,
  chunks,
}) {
  const response = await apiFetch("/api/chat/messages", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      paper_id: paperId,
      chunks,
    }),
  });
  return parseResponse(response, "Unable to get an answer from your papers.");
}
