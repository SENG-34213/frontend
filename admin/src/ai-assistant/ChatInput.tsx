import { useState } from "react";
import { Icon } from "@/components/admin/Icon";

export function ChatInput({ disabled, onSend }: { disabled?: boolean; onSend: (message: string) => void }) {
  const [value, setValue] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message || disabled) return;
    onSend(message);
    setValue("");
  }
  return <form className="ai-chat-input-form" onSubmit={submit}><label className="sr-only" htmlFor="ai-chat-input">Ask Mentify AI</label><textarea id="ai-chat-input" rows={1} value={value} disabled={disabled} placeholder="Ask about students, courses, attendance, or academy activity…" onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button className="primary-button ai-send-button" type="submit" disabled={disabled || !value.trim()} aria-label="Send message"><Icon name="arrow" size={17} /></button></form>;
}
