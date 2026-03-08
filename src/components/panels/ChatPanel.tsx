import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string };

const initial: Msg[] = [
  { role: "assistant", content: "Hi! I'm your AI tutor. Ask me anything about your study material — from biology to calculus, I'm here to help. 📚" },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    // Mock AI response
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "That's a great question! To give you a proper AI-powered answer, connect Lovable Cloud for real-time AI tutoring. For now, I can help you navigate the study tools available in the sidebar!",
        },
      ]);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-auto space-y-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-3 border-t border-border">
        <Input
          placeholder="Ask your AI tutor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1"
        />
        <Button size="icon" onClick={send}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
