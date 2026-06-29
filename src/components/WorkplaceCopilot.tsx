import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, MessageSquare, Brain, RefreshCw, Layers, ShieldAlert, Calendar } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
}

interface WorkplaceCopilotProps {
  onQueryCopilot: (query: string) => Promise<string>;
}

export default function WorkplaceCopilot({ onQueryCopilot }: WorkplaceCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_init",
      sender: "copilot",
      text: "Hi there! I am your Gemini-powered MNC Workplace Copilot. I can query our active tasks list, calendar slots, and compliance documents in real-time. How can I assist you with planning today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const reply = await onQueryCopilot(trimmed);
      const copilotMsg: Message = {
        id: "c_" + Math.random().toString(36).substring(2, 9),
        sender: "copilot",
        text: reply,
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: "err_" + Math.random().toString(36).substring(2, 9),
        sender: "copilot",
        text: "I ran into an issue connecting to the database query service. Please check your environment configurations.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Prefilled smart query chips
  const suggestionChips = [
    { label: "Find workload bottlenecks", prompt: "Summarize active workload bottlenecks on our team. Who has too many active tasks?", icon: ShieldAlert },
    { label: "Outline next sprint goals", prompt: "Synthesize our pending high and critical tasks into 3 coherent sprint goals for the week.", icon: Layers },
    { label: "What meetings are today?", prompt: "Check our scheduled meetings calendar blocks. Summarize our topics and times for today.", icon: Calendar },
  ];

  return (
    <div id="workplace-copilot-container" className="relative z-50">
      
      {/* Floating launcher trigger bubble */}
      <motion.button
        id="copilot-floating-launcher"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-400 via-violet-600 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg cursor-pointer transition-all glow-cyan animate-bounce"
        style={{ animationDuration: "3s" }}
        title="Open Gemini Workplace Copilot"
      >
        <Sparkles className="h-5 w-5 animate-pulse" />
      </motion.button>

      {/* Expanded side slide-out drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="copilot-drawer-panel"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed bottom-22 right-6 w-96 h-[540px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Brain className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">MNC Workplace Copilot</h3>
                  <div className="text-4xs text-cyan-400 font-mono tracking-wider flex items-center gap-1 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping inline-block" /> Gemini Core Active
                  </div>
                </div>
              </div>

              <button
                id="copilot-close-btn"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable conversation logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
              {messages.map((msg) => {
                const isCopilot = msg.sender === "copilot";
                return (
                  <div
                    id={`chat-bubble-${msg.id}`}
                    key={msg.id}
                    className={`flex ${isCopilot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed border ${
                        isCopilot
                          ? "bg-slate-900 border-white/5 text-slate-200"
                          : "bg-violet-600 border-violet-500 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* Loader Typing bubble */}
              {loading && (
                <div id="chat-loading-bubble" className="flex justify-start">
                  <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                    Analyzing workplace database indices...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Smart Chips Suggestions shelf */}
            <div className="px-4 py-1.5 bg-slate-950/40 border-t border-white/5 space-y-1.5">
              <div className="text-4xs font-mono font-bold text-slate-400 uppercase tracking-wider">Suggested Queries</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                {suggestionChips.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      id={`suggestion-chip-btn-${idx}`}
                      key={idx}
                      onClick={() => handleSend(chip.prompt)}
                      className="flex items-center gap-1 shrink-0 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 px-2 py-1 text-4xs font-semibold text-slate-300 hover:text-cyan-400 transition-all"
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form Footer */}
            <form
              id="copilot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(query);
              }}
              className="p-3 border-t border-white/5 bg-slate-900/60 flex items-center gap-2"
            >
              <input
                id="copilot-query-input"
                type="text"
                placeholder="Ask about tasks, due dates, comment updates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-cyan-400 pl-3 pr-2 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500 font-sans"
              />
              <button
                id="copilot-send-btn"
                type="submit"
                disabled={loading || !query.trim()}
                className="h-8 w-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
