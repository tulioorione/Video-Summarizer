interface ResultDisplayProps {
  result: string;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const lines = result.split("\n");
  const sections: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      current = { title: line.replace("# ", ""), content: [] };
      sections.push(current);
    } else if (line.startsWith("## ")) {
      current = { title: line.replace("## ", ""), content: [] };
      sections.push(current);
    } else if (current) {
      current.content.push(line);
    }
  }

  if (sections.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-xl shadow-md text-left max-w-2xl mx-auto">
        <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-md text-left max-w-2xl mx-auto space-y-5">
      {sections.map((section, i) => (
        <div key={i}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {section.title}
          </h3>
          <div className="text-gray-600 leading-relaxed">
            {section.content.map((line, j) =>
              line.startsWith("- ") ? (
                <div key={j} className="flex gap-2 ml-2 mb-1">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{line.slice(2)}</span>
                </div>
              ) : line.trim() ? (
                <p key={j} className="mb-2">
                  {line}
                </p>
              ) : null
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
