import { useState } from "react";
import {
  Bot,
  FileText,
  Paperclip,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { usePaperStore } from "../../store/paperStore";
import { sendChatMessage } from "../../services/chatService";
import {
  addMessage,
  setChatError,
  setChatLoading,
  useChatStore,
} from "../../store/chatStore";

const suggestions = [
  "Summarize this paper",
  "What are the key methods?",
  "Find the research gaps",
];

function Chat() {
  const { selectedPaper } = usePaperStore();

  const [message, setMessage] = useState("");
  const { messages, isLoading } = useChatStore();

  async function sendMessage(event) {
    event.preventDefault();

    const trimmed = message.trim();

    if (!trimmed || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    addMessage(userMessage);
    setMessage("");
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        paperId: selectedPaper?.id || null,
      });

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      addMessage(assistantMessage);
    } catch {
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Something went wrong while processing your question. Please try again.",
      };

      addMessage(errorMessage);
      setChatError(errorMessage.content);
    } finally {
      setChatLoading(false);
    }
  }

  function handleSuggestion(suggestion) {
    setMessage(suggestion);
  }

  return (
    <section className="flex h-[calc(100vh-64px)] min-h-0 flex-col px-4 sm:h-[calc(100vh-76px)] sm:px-8 lg:px-10">
      <div className="flex shrink-0 items-center gap-4 border-b border-[#e1e7ec] py-5">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8f4f7] text-[#398798]">
          <Bot size={23} />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#173c5d] sm:text-2xl">
            Chat with your research
          </h1>

          <p className="mt-1 text-xs text-[#788598] sm:text-sm">
            Ask questions grounded in your uploaded papers.
          </p>

          {selectedPaper ? (
            <p className="mt-1 truncate text-[10px] font-semibold text-[#398798]">
              Current paper: {selectedPaper.title || selectedPaper.name}
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <div className="pt-10 text-center sm:pt-16">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#eaf7f5] text-[#3b9995]">
                <FileText size={20} />
              </div>

              <h2 className="mt-4 text-sm font-bold text-[#405369]">
                Start with a question
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#8997a6]">
                Ask about your uploaded papers. Your RAG-powered answers will
                appear here.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleSuggestion(item)}
                    className="rounded-full border border-[#dbe5e9] bg-white px-3 py-2 text-[10px] text-[#536f7d] hover:bg-[#edf6fa]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[85%] items-start gap-2 ${
                      item.role === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
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
                      {item.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading ? (
                <div className="flex items-start gap-2">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f4f7] text-[#398798]">
                    <Bot size={14} />
                  </div>

                  <div className="rounded-2xl rounded-tl-sm border border-[#e1e7ec] bg-white px-4 py-3 text-xs text-[#8997a6]">
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#e1e7ec] bg-[#f6f8fa] py-4">
        <form className="mx-auto max-w-3xl" onSubmit={sendMessage}>
          <div className="flex items-center gap-2 rounded-xl border border-[#dbe3e8] bg-white px-3 py-2 shadow-sm focus-within:border-[#64a9b0]">
            <button
              type="button"
              className="text-[#9aa7b6]"
              title="Attach paper"
              onClick={() => {}}
            >
              <Paperclip size={17} />
            </button>

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
            AI response integration will connect here.
          </p>
        </form>
      </div>
    </section>
  );
}

export default Chat;