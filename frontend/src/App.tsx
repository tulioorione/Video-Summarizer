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

    controllerRef.current = summarizeVideo(url, {
      onProgress(data) {
        setCurrentStep(data.step);
        setProgressMsg(data.message);
      },
      onDone(data) {
        setResult(data.result);
        setCurrentStep("done");
        setProgressMsg("Resumo concluído!");
        setLoading(false);

        const entry: HistoryEntry = {
          url,
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
    setResult(entry.result);
    setError(null);
    setCurrentStep("done");
    setProgressMsg("Carregado do histórico");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-primary-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-primary-800/20 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/30 mb-6 animate-float">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent mb-3">
            Video Summarizer
          </h1>
          <p className="text-gray-400 text-lg">
            Cole uma URL do YouTube e receba um resumo inteligente com Gemini.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 space-y-5 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              URL do YouTube
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              </div>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-3.5 bg-linear-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] cursor-pointer relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando...
              </span>
            ) : (
              "Resumir"
            )}
            {loading && <div className="absolute inset-0 animate-shimmer" />}
          </button>
        </form>

        {/* Progress */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <ProgressBar currentStep={currentStep} message={progressMsg} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 glass rounded-xl border-red-500/30 text-red-300 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Result */}
        {result && <ResultDisplay result={result} />}

        {/* History */}
        <History entries={history} onSelect={handleHistorySelect} />
      </div>
    </div>
  );
}
