interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function FilterChips({ chips, selectedId, onSelect }: FilterChipsProps) {
  return (
    <div className="flex min-h-0 flex-wrap gap-1.5" role="group">
      {chips.map((chip) => {
        const selected = chip.id === selectedId;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(chip.id)}
            className={`min-w-[110px] shrink-0 rounded-md border px-2.5 py-1 text-sm font-medium shadow-sm transition ${
              selected
                ? "border-violet-300/90 bg-violet-100/85 text-violet-900"
                : "border-stone-200/90 bg-stone-50/70 text-stone-700 hover:border-violet-200/90 hover:bg-violet-50/80"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
