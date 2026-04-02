export interface HistoryEntry {
  url: string;
  model: "claude" | "gpt";
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
    <div className="mt-10 max-w-2xl mx-auto">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Recent Summaries
      </h3>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <button
            key={i}
            onClick={() => onSelect(entry)}
            className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 truncate max-w-[70%]">
                {entry.url}
              </span>
              <div className="flex gap-2 items-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase font-medium">
                  {entry.model}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
