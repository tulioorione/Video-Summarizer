export interface HistoryEntry {
  url: string;
  result: string;
  timestamp: number;
}

const STORAGE_KEY = "video-summarizer-history";
const MAX_ENTRIES = 5;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  const history = loadHistory();
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
}

interface HistoryProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}

export default function History({ entries, onSelect }: HistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Resumos Recentes
      </h3>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <button
            key={i}
            onClick={() => onSelect(entry)}
            className="w-full text-left p-4 glass rounded-xl glass-hover transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
          >
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                {entry.url}
              </span>
              <span className="text-xs text-gray-500 shrink-0">
                {new Date(entry.timestamp).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
