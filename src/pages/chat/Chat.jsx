import { useEffect, useState } from "react";
import {
  Bot,
  FileText,
  History,
  Plus,
  Search,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { usePaperStore } from "../../store/paperStore";
import {
  getConversationMessages,
  getConversations,
  getCachedPaperChunks,
  getQueryEmbedding,
  selectRelevantChunks,
  sendChatMessage,
} from "../../services/chatService";
import { useAuthStore } from "../../store/authStore";
import {
  setChatLoading,
  setMessages,
  useChatStore,
} from "../../store/chatStore";

const suggestions = [
  "Summarize this paper",
  "What are the key methods?",
  "What are the main findings?",
];

function Chat() {
  const { papers, selectedPaper } = usePaperStore();
  const { user } = useAuthStore();
  const { messages, isLoading } = useChatStore();
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoadingHistory(false));
  }, []);

  async function openConversation(id) {
    setError("");
    setConversationId(id);
    try {
      const history = await getConversationMessages(id);
      setMessages(history);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setError("");
  }

  async function sendMessage(event) {
    event.preventDefault();
    const question = message.trim();
    if (!question || isLoading) return;

    const previousMessages = messages;
    setMessages([
      ...messages,
      { id: `pending-${Date.now()}`, role: "user", content: question },
    ]);
    setMessage("");
    setError("");
    setChatLoading(true);

    try {
      const activeConversation = conversations.find(
        (conversation) => conversation.id === conversationId
      );
      const paperId = activeConversation
        ? activeConversation.paper_id
        : selectedPaper?.id || null;
      const targetPapers = paperId
        ? papers.filter((paper) => paper.id === paperId)
        : papers;
      if (!targetPapers.length) {
        throw new Error("Upload or select a research paper before asking a question.");
      }
      if (!user?.id) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const [chunkGroups, queryEmbedding] = await Promise.all([
        Promise.all(
          targetPapers.map((paper) => getCachedPaperChunks(user.id, paper))
        ),
        getQueryEmbedding(question),
      ]);
      const relevantChunks = selectRelevantChunks(
        queryEmbedding,
        chunkGroups.flat()
      );

      const response = await sendChatMessage({
        message: question,
        conversationId,
        paperId,
        chunks: relevantChunks,
      });
      setConversationId(response.conversation_id);
      if (!conversationId) {
        setConversations((currentConversations) => [
          {
            id: response.conversation_id,
            title: question.slice(0, 80),
            paper_id: paperId,
            updated_at: new Date().toISOString(),
          },
          ...currentConversations.filter(
            (conversation) => conversation.id !== response.conversation_id
          ),
        ]);
      }
      setMessages([
        ...previousMessages,
        { id: `user-${Date.now()}`, role: "user", content: question },
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ]);
      getConversations().then(setConversations).catch((historyError) => {
        setError(historyError.message);
      });
    } catch (sendError) {
      setMessages(previousMessages);
      setError(sendError.message);
    } finally {
      setChatLoading(false);
    }
  }

  const visibleConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex h-[calc(100vh-64px)] min-h-0 flex-col px-3 sm:h-[calc(100vh-76px)] sm:px-6 lg:px-8">
      <div className="flex min-h-0 flex-1 gap-4 py-4">
        <aside className="flex w-44 shrink-0 flex-col rounded-xl border border-[#e1e7ec] bg-white p-3 sm:w-56">
          <button
            type="button"
            onClick={startNewChat}
            className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#173c5d] px-3 text-xs font-bold text-white hover:bg-[#245877]"
          >
            <Plus size={15} /> New chat
          </button>
          <label className="mt-3 flex items-center gap-2 rounded-lg border border-[#e1e7ec] px-2.5">
            <Search size={14} className="shrink-0 text-[#9aa7b6]" />
            <input
              className="min-w-0 flex-1 py-2 text-xs outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chat history"
            />
          </label>
          <div className="mt-4 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wide text-[#9aa7b6]">
            <History size={13} /> Recent chats
          </div>
          <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {loadingHistory ? (
              <p className="px-2 py-3 text-xs text-[#8997a6]">Loading...</p>
            ) : visibleConversations.length ? (
              visibleConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation.id)}
                  className={`w-full truncate rounded-lg px-2.5 py-2.5 text-left text-xs ${
                    conversationId === conversation.id
                      ? "bg-[#eaf5f7] font-semibold text-[#126b91]"
                      : "text-[#536477] hover:bg-[#f3f7f8]"
                  }`}
                  title={conversation.title}
                >
                  {conversation.title}
                </button>
              ))
            ) : (
              <p className="px-2 py-3 text-xs leading-relaxed text-[#8997a6]">
                Your saved chats will appear here.
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center gap-3 border-b border-[#e1e7ec] py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f4f7] text-[#398798]">
              <Bot size={21} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-[#173c5d] sm:text-xl">
                Chat with your research
              </h1>
              <p className="truncate text-xs text-[#788598]">
                {selectedPaper
                  ? `Using ${selectedPaper.title || selectedPaper.name}`
                  : "Ask questions grounded in your uploaded papers"}
              </p>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto py-5">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.length === 0 ? (
                <div className="pt-10 text-center sm:pt-16">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#eaf7f5] text-[#3b9995]">
                    <FileText size={20} />
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-[#405369]">
                    Ask your papers anything
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#8997a6]">
                    Answers use relevant chunks from your uploaded research and
                    include paper/page references.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => setMessage(suggestion)}
                        className="rounded-full border border-[#dbe5e9] bg-white px-3 py-2 text-[10px] text-[#536f7d] hover:bg-[#edf6fa]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[92%] items-start gap-2 ${
                        item.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                          item.role === "user"
                            ? "bg-[#e8f0f5] text-[#536f7d]"
                            : "bg-[#e8f4f7] text-[#398798]"
                        }`}
                      >
                        {item.role === "user" ? (
                          <User size={14} />
                        ) : (
                          <Bot size={14} />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          item.role === "user"
                            ? "rounded-tr-sm bg-[#173c5d] text-white"
                            : "rounded-tl-sm border border-[#e1e7ec] bg-white text-[#536477]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{item.content}</p>
                        {item.sources?.length ? (
                          <div className="mt-3 border-t border-[#e1e7ec] pt-2">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#788598]">
                              Sources
                            </p>
                            {item.sources.map((source, index) => (
                              <p
                                key={`${source.paper_id}-${source.page}-${index}`}
                                className="text-[10px] leading-5 text-[#398798]"
                              >
                                {source.title}
                                {source.page ? ` · page ${source.page}` : ""}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading ? (
                <div className="flex items-start gap-2 text-xs text-[#8997a6]">
                  <Bot size={17} /> Searching paper chunks...
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-[#e1e7ec] py-3">
            {error ? (
              <p role="alert" className="mx-auto mb-2 max-w-3xl text-xs text-red-600">
                {error}
              </p>
            ) : null}
            <form className="mx-auto max-w-3xl" onSubmit={sendMessage}>
              <div className="flex items-center gap-2 rounded-xl border border-[#dbe3e8] bg-white px-3 py-2 shadow-sm focus-within:border-[#64a9b0]">
                <input
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask a question about your papers..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-[#173c5d] text-white disabled:bg-[#b9c7cf]"
                  disabled={!message.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#a0aab7]">
                <Sparkles size={12} />
                Answers are generated from your uploaded paper chunks.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Chat;
