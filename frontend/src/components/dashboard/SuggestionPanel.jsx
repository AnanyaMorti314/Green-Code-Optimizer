const severityConfig = {
  critical: { color: 'red',    label: 'CRITICAL', bg: 'bg-red-500/10 border-red-500/30' },
  warning:  { color: 'orange', label: 'WARNING',  bg: 'bg-orange-500/10 border-orange-500/30' },
  info:     { color: 'blue',   label: 'INFO',     bg: 'bg-blue-500/10 border-blue-500/30' },
};

export default function SuggestionPanel({ issues = [] }) {
  if (!issues.length) return (
    <div className="glass rounded-2xl p-6 flex items-center justify-center h-full">
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">✅</div>
        <p>No issues found!</p>
      </div>
    </div>
  );

  const sorted = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] || 2) - (order[b.severity] || 2);
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 font-semibold text-sm flex items-center gap-2">
        <span>🛠</span> Suggestions ({issues.length})
      </div>
      <div className="overflow-y-auto max-h-[560px] space-y-3 p-3">
        {sorted.map((issue, i) => {
          const cfg = severityConfig[issue.severity] || severityConfig.info;
          return (
            <div key={i} className={`border rounded-xl p-3 ${cfg.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold text-${cfg.color}-400`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-gray-500">Line {issue.lineStart}</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{issue.message}</p>
              <div className="bg-black/30 rounded-lg p-2">
                <p className="text-xs text-green-400">💡 {issue.suggestion}</p>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                CO₂ impact: ~{issue.co2Impact?.toFixed(3)}g/run
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}