"use client";
import { useState } from "react";

export default function AuraTerminal() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState([{ type: 'system', content: 'Aura Engine v1.0 online...' }]);

  const handleSend = async () => {
    if (!input) return;
    
    const userMessage = input;
    setInput(""); 

    setLogs(prev => [...prev, { type: 'user', content: userMessage }]);
    setLogs(prev => [...prev, { type: 'process', content: 'Consultando Vector DB...' }]);
    
    try {
      const response = await fetch('/api/aura/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, history: [] })
      });
      
      const data = await response.json();
      setLogs(prev => [...prev, { type: 'aura', content: data.answer }]);
    } catch (error) {
      setLogs(prev => [...prev, { type: 'system', content: 'Erro ao contactar a Aura.' }]);
    }
  };

  // ... (restante do código visual permanece igual)
}