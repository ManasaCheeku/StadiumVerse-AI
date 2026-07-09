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
      <label
        htmlFor="persona-select"
        className="mb-2 block text-sm text-slate-400"
      >
        Persona
      </label>

      <select
        id="persona-select"
        name="persona"
        aria-label="Select user persona"
        value={value}
        onChange={(e) => onChange(e.target.value as Persona)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {personas.map((persona) => (
          <option
            key={persona}
            value={persona}
          >
            {persona}
          </option>
        ))}
      </select>
    </div>
  );
}