const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type Step = "downloading" | "transcribing" | "summarizing" | "done";

export interface ProgressEvent {
  step: Step;
  message: string;
}

export interface DoneEvent {
  result: string;
}

export interface ErrorEvent {
  message: string;
}

export interface SummarizeCallbacks {
  onProgress: (data: ProgressEvent) => void;
  onDone: (data: DoneEvent) => void;
  onError: (error: string) => void;
}

export function summarizeVideo(
  url: string,
  model: "claude" | "gpt",
  callbacks: SummarizeCallbacks
): AbortController {
  const controller = new AbortController();

  fetch(`${API_URL}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, model }),
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      function processBuffer() {
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (currentEvent === "progress") {
              callbacks.onProgress(data as ProgressEvent);
            } else if (currentEvent === "done") {
              callbacks.onDone(data as DoneEvent);
            } else if (currentEvent === "error") {
              callbacks.onError((data as ErrorEvent).message);
            }
            currentEvent = "";
          }
        }
      }

      function read(): Promise<void> {
        return reader!.read().then(({ done, value }) => {
          if (done) return;
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
          return read();
        });
      }

      return read();
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        callbacks.onError(err.message || "Connection failed");
      }
    });

  return controller;
}
