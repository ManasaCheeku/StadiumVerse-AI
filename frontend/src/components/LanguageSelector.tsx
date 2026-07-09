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
      <label
        htmlFor="language-select"
        className="mb-2 block text-sm text-slate-400"
      >
        Language
      </label>

      <select
        id="language-select"
        name="language"
        aria-label="Select language"
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {languages.map((language) => (
          <option
            key={language}
            value={language}
          >
            {language}
          </option>
        ))}
      </select>
    </div>
  );
}