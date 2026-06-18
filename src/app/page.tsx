"use client";

import {
  Bot,
  ChevronRight,
  Copy,
  Edit3,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── TYPES ───────────────────────────────────────────────── */

interface Message {
  id: string;
  role: "user" | "aura";
  content: string;
  timestamp: Date;
  liked?: boolean | null;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/* ─── HELPERS ─────────────────────────────────────────────── */

const uid = () => Math.random().toString(36).slice(2, 10);

const SUGGESTIONS = [
  { icon: "✦", label: "Resuma um documento", prompt: "Como você pode me ajudar a resumir documentos?" },
  { icon: "◈", label: "Analise dados", prompt: "Quais análises você consegue fazer sobre dados?" },
  { icon: "⌘", label: "Escreva código", prompt: "Você consegue ajudar com programação e desenvolvimento?" },
  { icon: "◎", label: "Crie conteúdo", prompt: "Me ajude a criar conteúdo criativo e persuasivo." },
];

/* ─── MARKDOWN LITE ──────────────────────────────────────── */

function renderContent(text: string) {
  // Bold **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return { __html: html };
}

/* ─── ORBIT LOGO ─────────────────────────────────────────── */

function AuraOrbit({ size = 40 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full gradient-aura animate-gradient"
        style={{ filter: "blur(8px)", opacity: 0.6 }}
      />
      <div
        className="orbit-ring absolute"
        style={{ width: size * 1.4, height: size * 1.4, animationDuration: "6s" }}
      />
      <div
        className="orbit-ring absolute"
        style={{
          width: size * 1.7,
          height: size * 1.7,
          animationDuration: "10s",
          animationDirection: "reverse",
          borderColor: "rgba(139,92,246,0.2)",
        }}
      />
      <div
        className="relative rounded-full gradient-aura flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Bot size={size * 0.45} color="white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

/* ─── MESSAGE BUBBLE ─────────────────────────────────────── */

function MessageBubble({
  msg,
  isDark,
  onLike,
  onCopy,
  onRetry,
}: {
  msg: Message;
  isDark: boolean;
  onLike: (id: string, v: boolean) => void;
  onCopy: (text: string) => void;
  onRetry?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isAura = msg.role === "aura";

  const handleCopy = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`flex gap-3 group animate-fade-slide-up ${
        isAura ? "justify-start" : "justify-end"
      }`}
    >
      {/* Avatar */}
      {isAura && (
        <div className="shrink-0 mt-1">
          <AuraOrbit size={32} />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[82%] ${isAura ? "" : "items-end"}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isAura
              ? `glass rounded-tl-none border-l-2 ${
                  isDark ? "border-[rgba(34,211,238,0.2)]" : "border-cyan-300"
                }`
              : "gradient-aura text-white rounded-tr-none shadow-lg"
          }`}
          style={isAura ? { color: "var(--text-primary)" } : undefined}
        >
          {isAura ? (
            <div
              className="message-prose"
              dangerouslySetInnerHTML={renderContent(msg.content)}
            />
          ) : (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          )}
        </div>

        {/* Actions */}
        <div
          className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isAura ? "" : "flex-row-reverse"
          }`}
        >
          <span
            style={{ color: "var(--text-muted)", fontSize: "10px" }}
            className="px-1"
          >
            {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isAura && (
            <>
              <ActionBtn onClick={handleCopy} title="Copiar">
                {copied ? (
                  <span style={{ fontSize: 9, color: "var(--accent-cyan)" }}>✓</span>
                ) : (
                  <Copy size={12} />
                )}
              </ActionBtn>
              <ActionBtn
                onClick={() => onLike(msg.id, true)}
                title="Útil"
                active={msg.liked === true}
              >
                <ThumbsUp size={12} />
              </ActionBtn>
              <ActionBtn
                onClick={() => onLike(msg.id, false)}
                title="Não útil"
                active={msg.liked === false}
              >
                <ThumbsDown size={12} />
              </ActionBtn>
              {onRetry && (
                <ActionBtn onClick={() => onRetry(msg.id)} title="Regenerar">
                  <RotateCcw size={12} />
                </ActionBtn>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isAura && (
        <div
          className="shrink-0 mt-1 w-8 h-8 rounded-full glass flex items-center justify-center"
          style={{ border: "1px solid var(--border-default)" }}
        >
          <User size={14} style={{ color: "var(--text-secondary)" }} />
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1 rounded-md transition-all"
      style={{
        color: active ? "var(--accent-cyan)" : "var(--text-muted)",
        background: active ? "rgba(34,211,238,0.08)" : undefined,
      }}
      onMouseEnter={(e) =>
        !active && ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
      }
      onMouseLeave={(e) =>
        !active && ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
      }
    >
      {children}
    </button>
  );
}

/* ─── TYPING INDICATOR ───────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-slide-up">
      <div className="shrink-0 mt-1">
        <AuraOrbit size={32} />
      </div>
      <div
        className="glass rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5"
        style={{ border: "1px solid var(--border-default)" }}
      >
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-cyan)" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-violet)" }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-pink)" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 4 }}>Aura está processando...</span>
      </div>
    </div>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────── */

function EmptyState({ onSuggestion }: { onSuggestion: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in px-4">
      <div className="mb-8">
        <AuraOrbit size={72} />
      </div>
      <h1
        className="text-3xl font-bold mb-2 gradient-text"
        style={{ letterSpacing: "-0.02em" }}
      >
        Aura Intelligence
      </h1>
      <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
        Powered by Groq · LLaMA 3.3 70B
      </p>
      <p className="text-xs mb-10" style={{ color: "var(--text-muted)" }}>
        Processamento ultra-rápido • RAG integrado
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestion(s.prompt)}
            className="glass group flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              border: "1px solid var(--border-default)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)")
            }
          >
            <span className="text-xl w-8 text-center shrink-0">{s.icon}</span>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {s.label}
              </p>
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                {s.prompt}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--accent-cyan)" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── STATUS BAR ─────────────────────────────────────────── */

function StatusBar({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-1.5 h-1.5 rounded-full transition-all ${
          active ? "animate-pulse" : ""
        }`}
        style={{ background: active ? "var(--accent-cyan)" : "var(--text-muted)" }}
      />
      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
        {active ? "Processando..." : "Online"}
      </span>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────── */

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Sessão ativa */
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages ?? [];

  /* Init */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aura-sessions");
      if (saved) {
        const parsed: Session[] = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      }
      const theme = localStorage.getItem("aura-theme");
      if (theme === "light") setIsDark(false);
    } catch {}
    if (window.innerWidth < 1024) setSidebarOpen(false);
    const onResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Persist */
  useEffect(() => {
    localStorage.setItem("aura-sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("aura-theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("light-mode", !isDark);
  }, [isDark]);

  /* Scroll to bottom */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  /* Auto-resize textarea */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  /* Nova sessão */
  const newSession = useCallback(() => {
    const s: Session = {
      id: uid(),
      title: "Nova conversa",
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  /* Enviar */
  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isLoading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Garantir sessão ativa
    let sessionId = activeSessionId;
    if (!sessionId) {
      const s: Session = {
        id: uid(),
        title: text.slice(0, 32),
        messages: [],
        createdAt: new Date(),
      };
      setSessions([s]);
      setActiveSessionId(s.id);
      sessionId = s.id;
    }

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          title: s.messages.length === 0 ? text.slice(0, 36) : s.title,
          messages: [...s.messages, userMsg],
        };
      })
    );

    setIsLoading(true);
    if (window.innerWidth < 1024) setSidebarOpen(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.answer || "Erro na conexão");

      const auraMsg: Message = {
        id: uid(),
        role: "aura",
        content: data.answer,
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id !== sessionId ? s : { ...s, messages: [...s.messages, auraMsg] }
        )
      );
    } catch (err: any) {
      const errMsg: Message = {
        id: uid(),
        role: "aura",
        content: `⚠️ ${err.message || "Erro desconhecido. Tente novamente."}`,
        timestamp: new Date(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id !== sessionId ? s : { ...s, messages: [...s.messages, errMsg] }
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (msgId: string, value: boolean) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id !== activeSessionId
          ? s
          : {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId ? { ...m, liked: m.liked === value ? null : value } : m
              ),
            }
      )
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining[0]?.id ?? "");
    }
  };

  /* ── RENDER ───────────────────────────────────────────── */

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? "" : "light-mode"}`}
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── TOAST ── */}
      {copiedToast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-scale-in px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-accent)",
            color: "var(--accent-cyan)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          ✓ Copiado para área de transferência
        </div>
      )}

      {/* ── OVERLAY MOBILE ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          lg:relative lg:translate-x-0 transition-all duration-300
          ${sidebarOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:hidden"}
        `}
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Logo */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center gap-2.5">
            <AuraOrbit size={28} />
            <div>
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Aura
              </span>
              <span
                className="ml-1.5 text-[9px] font-mono px-1 py-0.5 rounded"
                style={{
                  color: "var(--accent-cyan)",
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.15)",
                }}
              >
                v2.0
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nova Conversa */}
        <div className="p-3">
          <button
            onClick={newSession}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
              color: "white",
              boxShadow: "0 2px 12px rgba(34,211,238,0.2)",
            }}
          >
            <Plus size={16} />
            Nova Conversa
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          <p
            className="px-2 py-1 text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            Histórico
          </p>
          {sessions.length === 0 && (
            <p className="px-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Nenhuma conversa ainda
            </p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`sidebar-item ${s.id === activeSessionId ? "active" : ""} group`}
              onClick={() => {
                setActiveSessionId(s.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <MessageSquare size={13} className="shrink-0" />
              <span className="truncate flex-1" style={{ fontSize: 12 }}>
                {s.title || "Conversa"}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:text-rose-400"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                style={{ color: "var(--text-muted)" }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer sidebar */}
        <div
          className="p-3 space-y-1"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <div className="sidebar-item">
            <Zap size={13} />
            <span>LLaMA 3.3 70B · Groq</span>
          </div>
          <div className="sidebar-item">
            <Settings size={13} />
            <span>Configurações</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
        {/* Header */}
        <header
          className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-default)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--bg-overlay)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "transparent")
              }
            >
              <Menu size={19} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <AuraOrbit size={26} />
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Aura
              </span>
            </div>
            <StatusBar active={isLoading} />
          </div>

          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-xl transition-all"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setIsDark(!isDark)}
              title="Alternar tema"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-scroll p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto space-y-5">
            {messages.length === 0 ? (
              <EmptyState onSuggestion={(p) => handleSend(p)} />
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isDark={isDark}
                    onLike={handleLike}
                    onCopy={handleCopy}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
          </div>
        </div>

        {/* Input area */}
        <div
          className="shrink-0 p-4 md:p-5"
          style={{ borderTop: "1px solid var(--border-default)", background: "var(--bg-surface)" }}
        >
          <div className="max-w-2xl mx-auto">
            <div
              className="glass input-glow flex items-end gap-3 p-3 rounded-2xl transition-all"
              style={{ border: "1px solid var(--border-default)" }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:opacity-50"
                style={{ color: "var(--text-primary)", minHeight: 24, maxHeight: 140 }}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pergunte à Aura… (Enter para enviar, Shift+Enter para nova linha)"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  className="p-2 rounded-xl transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  title="Áudio (em breve)"
                >
                  <Mic size={16} />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 rounded-xl transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
                    color: "white",
                    boxShadow: "0 2px 10px rgba(34,211,238,0.25)",
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            <p
              className="text-center mt-2"
              style={{ color: "var(--text-muted)", fontSize: 10 }}
            >
              Aura pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
