export async function sendChatMessage({ message, paperId = null }) {
  // Temporary frontend implementation.
  // Replace this with the FastAPI request when the RAG backend is ready.

  await new Promise((resolve) => setTimeout(resolve, 800));
  const question = message.trim();

  return {
    answer: paperId
      ? `This is a temporary response to: "${question}" for the selected paper. The real RAG-generated answer will appear here once the backend is connected.`
      : `This is a temporary response to: "${question}". The real RAG-generated answer will appear here once the backend is connected.`,
    sources: [],
  };
}