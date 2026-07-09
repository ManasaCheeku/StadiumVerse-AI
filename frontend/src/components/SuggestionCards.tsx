interface Props {
  onSelect: (text: string) => void;
}

const suggestions = [
  "🧭 Find my gate",
  "🚻 Nearest washroom",
  "🍔 Recommend food",
  "♿ Accessible route",
  "🚨 Emergency help",
  "🌍 Translate announcement",
];

export default function SuggestionCards({ onSelect }: Props) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">
        Suggested Questions
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {suggestions.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left hover:border-sky-500 transition"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}