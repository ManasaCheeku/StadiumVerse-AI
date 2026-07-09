import { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
}

function parseSections(text: string) {
  const sections: Record<string, string> = {};

  const keys = [
    "Summary",
    "Recommended Action",
    "Reasoning",
    "Alternative",
    "Accessibility",
    "Safety",
  ];

  let current = "Summary";
  sections[current] = "";

  text.split("\n").forEach((line) => {
    const found = keys.find((k) => line.startsWith(k));

    if (found) {
      current = found;
      sections[current] = line.replace(found + ":", "").trim();
    } else {
      sections[current] = (sections[current] || "") + " " + line.trim();
    }
  });

  return sections;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-xl rounded-2xl bg-sky-600 px-5 py-3 text-white shadow-lg">
          {message.content}
        </div>
      </div>
    );
  }

  const data = parseSections(message.content);

  return (
    <div className="mb-6 flex justify-start">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h3 className="text-xl font-bold text-sky-400">
            🤖 StadiumVerse AI
          </h3>

          <div className="flex gap-2">

            <span className="rounded-full bg-green-600 px-3 py-1 text-xs">
              AI Online
            </span>

            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs">
              Context Aware
            </span>

          </div>

        </div>

        <div className="space-y-4">

          {Object.entries(data).map(([title, value]) => {

            if (!value.trim()) return null;

            return (
              <div
                key={title}
                className="rounded-xl border border-slate-700 bg-slate-800 p-5"
              >
                <h4 className="mb-2 font-bold text-sky-400">
                  {title}
                </h4>

                <p className="leading-7 text-slate-300">
                  {value}
                </p>

              </div>
            );

          })}

        </div>

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-sm">

            <span className="text-slate-400">
              AI Confidence
            </span>

            <span className="text-cyan-400">
              92%
            </span>

          </div>

          <div className="h-3 rounded-full bg-slate-700">

            <div className="h-3 w-[92%] rounded-full bg-cyan-400"></div>

          </div>

        </div>

      </div>
    </div>
  );
}