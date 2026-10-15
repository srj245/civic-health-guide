import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How does Medicare work?",
  "What bills affect insulin costs?",
  "Am I eligible for Medicaid?",
  "What is the ACA?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-chat`;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (resp.status === 429) {
        setMessages((prev) => [...prev, { role: "assistant", content: "I'm getting too many requests right now. Please try again in a moment." }]);
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        setMessages((prev) => [...prev, { role: "assistant", content: "AI credits have been exhausted. Please try again later." }]);
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const content = assistantSoFar;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      if (!assistantSoFar) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-fab fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:right-6"
          aria-label="Open health policy chat"
        >
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div role="dialog" aria-label="Health policy chat" className="chat-panel fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[calc(100vh-6rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-border max-sm:inset-x-4 max-sm:bottom-4 max-sm:h-[70dvh] max-sm:w-auto max-sm:max-w-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium text-foreground">Health policy chat</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-relevant="additions text" aria-busy={isLoading}>
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Sparkles className="mx-auto mb-3 h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="mb-4 text-sm text-muted-foreground">Ask a question about US health policy.</p>
                <div className="space-y-2">
                  {STARTERS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user" ? "bg-foreground text-background" : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="rounded-md bg-secondary px-4 py-2 text-sm text-muted-foreground">
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <label htmlFor="chat-input" className="sr-only">Ask about health policy</label>
              <Input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about health policy…"
                className="h-10 flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0" aria-label="Send message">
                <Send className="w-4 h-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
