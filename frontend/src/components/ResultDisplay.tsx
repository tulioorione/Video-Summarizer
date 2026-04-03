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
      <div className="mt-8 p-6 glass rounded-2xl text-left max-w-2xl mx-auto animate-fade-in-up">
        <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 glass rounded-2xl text-left max-w-2xl mx-auto overflow-hidden animate-fade-in-up">
      {sections.map((section, i) => (
        <div
          key={i}
          className="p-6 border-b border-white/5 last:border-b-0 animate-fade-in-up"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            {i === 0 && (
              <span className="w-2 h-2 rounded-full bg-primary-400 inline-block" />
            )}
            {section.title}
          </h3>
          <div className="text-gray-300 leading-relaxed">
            {section.content.map((line, j) =>
              line.startsWith("- ") ? (
                <div key={j} className="flex gap-3 ml-1 mb-2 group">
                  <span className="text-primary-400 mt-0.5 transition-transform group-hover:scale-125">&#9670;</span>
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
