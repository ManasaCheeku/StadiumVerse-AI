import { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xl rounded-2xl bg-sky-600 px-5 py-3 text-white shadow-lg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-3xl w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">

        <h3 className="text-lg font-bold text-sky-400 mb-4">
          🤖 StadiumVerse AI
        </h3>

        <div className="grid gap-4">

          <section className="rounded-xl bg-slate-800 p-4">
            <h4 className="font-semibold text-emerald-400">Summary</h4>
            <p className="text-slate-300 mt-2">{message.content}</p>
          </section>

          <section className="rounded-xl bg-slate-800 p-4">
            <h4 className="font-semibold text-blue-400">
              Recommended Action
            </h4>
            <p className="text-slate-300 mt-2">
              Follow the AI recommendation shown above.
            </p>
          </section>

          <section className="rounded-xl bg-slate-800 p-4">
            <h4 className="font-semibold text-yellow-400">
              Reasoning
            </h4>
            <p className="text-slate-300 mt-2">
              Generated using available stadium operational context.
            </p>
          </section>

          <section className="rounded-xl bg-slate-800 p-4">
            <h4 className="font-semibold text-purple-400">
              Alternative
            </h4>
            <p className="text-slate-300 mt-2">
              Another nearby option may be available.
            </p>
          </section>

          <section className="rounded-xl bg-emerald-900/30 border border-emerald-600 p-4">
            <h4 className="font-semibold text-emerald-400">
              Accessibility
            </h4>
            <p className="text-slate-300 mt-2">
              Accessible routes are prioritised whenever required.
            </p>
          </section>

          <section className="rounded-xl bg-red-900/30 border border-red-600 p-4">
            <h4 className="font-semibold text-red-400">
              Safety
            </h4>
            <p className="text-slate-300 mt-2">
              Follow official FIFA announcements and stadium staff instructions during emergencies.
            </p>
          </section>

          <section className="rounded-xl bg-slate-800 p-4">
            <h4 className="font-semibold text-cyan-400">
              Confidence
            </h4>

            <div className="w-full h-3 rounded-full bg-slate-700 mt-3">
              <div className="h-3 w-[92%] rounded-full bg-cyan-400"></div>
            </div>

            <p className="text-sm text-slate-400 mt-2">
              92% confidence (demo estimate)
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}