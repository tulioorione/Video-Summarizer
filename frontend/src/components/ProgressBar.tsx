import type { Step } from "../services/api";

const STEPS: { key: Step; label: string }[] = [
  { key: "downloading", label: "Downloading" },
  { key: "transcribing", label: "Transcribing" },
  { key: "summarizing", label: "Summarizing" },
  { key: "done", label: "Done" },
];

interface ProgressBarProps {
  currentStep: Step | null;
  message: string;
}

export default function ProgressBar({ currentStep, message }: ProgressBarProps) {
  if (!currentStep) return null;

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      <div className="flex justify-between mb-2">
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            className={`text-xs font-medium ${
              i <= currentIndex ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">{message}</p>
    </div>
  );
}
