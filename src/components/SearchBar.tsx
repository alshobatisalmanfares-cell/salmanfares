import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "ابحث...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border/70 bg-card/60 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="مسح"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function filterItems<T extends { title: string; description: string }>(items: T[], q: string): T[] {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((it) => it.title.toLowerCase().includes(s) || it.description.toLowerCase().includes(s));
}
