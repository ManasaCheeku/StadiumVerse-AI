import { Language } from "../types";

interface Props {
  value: Language;
  onChange: (value: Language) => void;
}

const languages: Language[] = [
  "English",
  "Hindi",
  "Kannada",
  "Spanish",
  "French",
];

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        Language
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
      >
        {languages.map((language) => (
          <option key={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
  );
}