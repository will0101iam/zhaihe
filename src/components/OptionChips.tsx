type OptionChipsProps<T extends string> = {
  label: string;
  options: T[];
  value: T | T[];
  multiple?: boolean;
  onChange: (value: T | T[]) => void;
};

export default function OptionChips<T extends string>({
  label,
  options,
  value,
  multiple = false,
  onChange,
}: OptionChipsProps<T>) {
  const selected = Array.isArray(value) ? value : [value];

  function handleClick(option: T) {
    if (!multiple) {
      onChange(option);
      return;
    }

    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(next as T[]);
  }

  return (
    <div className="field-group">
      <span className="field-label">{label}</span>
      <div className="chip-grid">
        {options.map((option) => (
          <button
            className={`chip ${selected.includes(option) ? 'chip-active' : ''}`}
            key={option}
            type="button"
            onClick={() => handleClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
