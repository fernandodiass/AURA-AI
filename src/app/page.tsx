"use client";

import {
  Menu,
  MessageSquare,
  Moon,
  Orbit,
  Plus,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  User
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "aura";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar configurações salvas
  useEffect(() => {
    const savedTheme = localStorage.getItem("aura-theme");
    if (savedTheme === "light") setIsDarkMode(false);
    
    const savedChat = localStorage.getItem("aura-messages");
    if (savedChat) setMessages(JSON.parse(savedChat));
  }, []);

  // Salvar alterações
  useEffect(() => {
    localStorage.setItem("aura-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("aura-messages", JSON.stringify(messages));
  }, [isDarkMode, messages]);

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.answer || "Erro na conexão");

      const auraMsg: Message = { role: "aura", content: data.answer };
      setMessages((prev) => [...prev, auraMsg]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "aura", content: `❌ Erro: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNÇÃO DE LIMPAR CONVERSA
  const clearChat = () => {
    if (messages.length === 0) return;
    if (confirm("Deseja apagar todo o histórico desta conversa?")) {
      setMessages([]);
      localStorage.removeItem("aura-messages");
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#0B0E14] text-slate-200" : "bg-slate-50 text-slate-900"}`}>
      
      {/* SIDEBAR */}
      <aside className={`transition-all duration-300 border-r ${isSidebarOpen ? "w-72" : "w-0 overflow-hidden border-none"} ${isDarkMode ? "bg-[#13171F] border-slate-800" : "bg-white border-slate-200"} flex flex-col`}>
        <div className="p-4">
          <button onClick={clearChat} className="w-full flex items-center gap-2 p-3 border rounded-xl hover:bg-blue-600 hover:text-white transition-all border-dashed border-slate-500 group">
            <Plus size={18} />
            <span className="text-sm font-medium">Nova Conversa</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 px-2">Histórico</p>
          {messages.length > 0 && (
            <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDarkMode ? "bg-slate-800/50" : "bg-blue-50 text-blue-700"}`}>
              <MessageSquare size={16} />
              <span className="text-sm truncate">{messages[0].content.substring(0, 20)}...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-sm">
            <Settings size={18} /> Configurações
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className={`h-16 flex items-center justify-between px-6 border-b backdrop-blur-md sticky top-0 z-10 ${isDarkMode ? "bg-[#0B0E14]/80 border-slate-800" : "bg-white/80 border-slate-200"}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              {/* ÍCONE ORBIT COM ANIMAÇÃO */}
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse">
                <Orbit size={22} className="text-white" />
              </div>
              <h2 className="font-bold tracking-tight">Aura <span className="text-blue-500 text-xs ml-1 font-mono uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/10 rounded">v2.0</span></h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? "hover:bg-rose-500/20 text-slate-400 hover:text-rose-500" : "hover:bg-rose-50 text-slate-500 hover:text-rose-600"}`}
              title="Limpar Conversa"
            >
              <Trash2 size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-all ${isDarkMode ? "hover:bg-slate-800 text-amber-400" : "hover:bg-slate-100 text-slate-600"}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* CHAT LOG */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <Sparkles size={32} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Conectado à Aura</h3>
                <p className="text-slate-500 max-w-sm">Sua interface inteligente está pronta. Como posso ajudar no seu projeto hoje?</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    msg.role === 'user' ? 'bg-blue-600' : (isDarkMode ? 'bg-slate-800 border border-blue-500/30' : 'bg-slate-200 text-slate-600')
                  }`}>
                    {msg.role === 'user' ? <User size={20} className="text-white" /> : <Orbit size={20} className="text-cyan-400" />}
                  </div>
                  
                  <div className={`p-5 rounded-2xl border ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/10 rounded-tr-none' 
                      : (isDarkMode ? 'bg-slate-800/40 border-slate-700/50 text-slate-200 rounded-tl-none' : 'bg-white border-slate-200 text-slate-800 rounded-tl-none')
                  }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`flex gap-3 p-5 rounded-2xl rounded-tl-none border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-100 border-slate-200'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className={`p-6 border-t ${isDarkMode ? "bg-[#0B0E14] border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="max-w-3xl mx-auto">
            <div className={`relative flex items-end border rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all ${
              isDarkMode ? "bg-slate-900 border-slate-700 shadow-2xl" : "bg-slate-50 border-slate-200 shadow-lg"
            }`}>
              <textarea
                rows={1}
                className="w-full p-4 pr-16 bg-transparent outline-none resize-none max-h-48 text-[15px]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pergunte à Aura..."
              />
              <div className="absolute right-3 bottom-3">
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-30 active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${isDarkMode ? "#1E293B" : "#E2E8F0"}; 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
}