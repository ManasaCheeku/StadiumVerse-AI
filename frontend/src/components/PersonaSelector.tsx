import { Persona } from "../types";

interface Props {
  value: Persona;
  onChange: (value: Persona) => void;
}

const personas: Persona[] = [
  "Fan",
  "Volunteer",
  "Security",
  "Operations",
  "Organizer",
];

export default function PersonaSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        Persona
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Persona)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
      >
        {personas.map((persona) => (
          <option key={persona}>
            {persona}
          </option>
        ))}
      </select>
    </div>
  );
}