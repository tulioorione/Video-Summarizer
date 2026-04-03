import type { Step } from "../services/api";

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: "downloading", label: "Baixando", icon: "arrow-down-tray" },
  { key: "transcribing", label: "Transcrevendo", icon: "microphone" },
  { key: "summarizing", label: "Resumindo", icon: "sparkles" },
  { key: "done", label: "Concluído", icon: "check-circle" },
];

interface ProgressBarProps {
  currentStep: Step | null;
  message: string;
}

export default function ProgressBar({ currentStep, message }: ProgressBarProps) {
  if (!currentStep) return null;

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const isDone = currentStep === "done";

  return (
    <div className="w-full max-w-xl mx-auto mt-8 animate-fade-in-up">
      {/* Step indicators */}
      <div className="flex justify-between mb-3">
        {STEPS.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={step.key}
              className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                isActive ? "text-primary-400" : "text-gray-600"
              } ${isCurrent && !isDone ? "scale-110" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isActive
                    ? "bg-primary-500/20 border border-primary-500/50"
                    : "bg-white/5 border border-white/10"
                } ${isCurrent && !isDone ? "animate-pulse-glow" : ""}`}
              >
                {i + 1}
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isDone
              ? "bg-green-500"
              : "bg-linear-to-r from-primary-600 to-primary-400 animate-progress-stripe"
          }`}
          style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Message */}
      <p className="text-sm text-gray-400 mt-3 text-center">{message}</p>
    </div>
  );
}
