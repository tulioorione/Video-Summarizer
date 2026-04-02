import { useState, useRef } from "react";
import { summarizeVideo, type Step } from "./services/api";
import ProgressBar from "./components/ProgressBar";
import ResultDisplay from "./components/ResultDisplay";
import History, {
  loadHistory,
  saveToHistory,
  type HistoryEntry,
} from "./components/History";

export default function App() {
  const [url, setUrl] = useState("");
  const [model, setModel] = useState<"claude" | "gpt">("claude");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const controllerRef = useRef<AbortController | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    controllerRef.current?.abort();

    setLoading(true);
    setResult(null);
    setError(null);
    setCurrentStep(null);
    setProgressMsg("");

    controllerRef.current = summarizeVideo(url, model, {
      onProgress(data) {
        setCurrentStep(data.step);
        setProgressMsg(data.message);
      },
      onDone(data) {
        setResult(data.result);
        setCurrentStep("done");
        setProgressMsg("Summary complete!");
        setLoading(false);

        const entry: HistoryEntry = {
          url,
          model,
          result: data.result,
          timestamp: Date.now(),
        };
        saveToHistory(entry);
        setHistory(loadHistory());
      },
      onError(msg) {
        setError(msg);
        setLoading(false);
        setCurrentStep(null);
      },
    });
  }

  function handleHistorySelect(entry: HistoryEntry) {
    setUrl(entry.url);
    setModel(entry.model);
    setResult(entry.result);
    setError(null);
    setCurrentStep("done");
    setProgressMsg("Loaded from history");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Video Summarizer
          </h1>
          <p className="text-gray-500">
            Paste a YouTube URL, choose your AI model, and get a smart summary.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              YouTube URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModel("claude")}
                disabled={loading}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer ${
                  model === "claude"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Claude
              </button>
              <button
                type="button"
                onClick={() => setModel("gpt")}
                disabled={loading}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all cursor-pointer ${
                  model === "gpt"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                GPT
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? "Processing..." : "Summarize"}
          </button>
        </form>

        <ProgressBar currentStep={currentStep} message={progressMsg} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {result && <ResultDisplay result={result} />}

        <History entries={history} onSelect={handleHistorySelect} />
      </div>
    </div>
  );
}
