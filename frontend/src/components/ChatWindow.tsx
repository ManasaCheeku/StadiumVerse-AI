import { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
}

export default function ChatWindow({ messages, loading }: Props) {
  return (
    <div className="flex flex-col gap-4 h-[600px] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6">

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}

      {loading && (
        <div className="flex items-center gap-2">

          <div className="h-3 w-3 rounded-full bg-sky-400 animate-bounce"></div>

          <div
            className="h-3 w-3 rounded-full bg-sky-400 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>

          <div
            className="h-3 w-3 rounded-full bg-sky-400 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>

          <span className="text-slate-400 ml-2">
            StadiumVerse AI is thinking...
          </span>

        </div>
      )}

    </div>
  );
}