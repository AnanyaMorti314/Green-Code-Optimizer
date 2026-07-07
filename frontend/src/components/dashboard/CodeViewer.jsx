import { useMemo } from 'react';

const severityStyle = {
  critical: 'bg-red-500/20 border-l-2 border-red-500',
  warning:  'bg-orange-500/15 border-l-2 border-orange-400',
  info:     'bg-blue-500/10 border-l-2 border-blue-400',
};

export default function CodeViewer({ file }) {
  const lines = file.code ? file.code.split('\n') : [];

  const issuesByLine = useMemo(() => {
    const map = {};
    (file.issues || []).forEach(issue => {
      for (let l = issue.lineStart; l <= issue.lineEnd; l++) {
        if (!map[l] || issue.severity === 'critical') map[l] = issue;
      }
    });
    return map;
  }, [file.issues]);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500"/>
          <span className="w-3 h-3 rounded-full bg-yellow-500"/>
          <span className="w-3 h-3 rounded-full bg-green-500"/>
          <span className="text-sm text-gray-400 ml-2">{file.filename.split('/').pop()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-800 rounded">{file.language}</span>
          <span>Score: {file.greenScore}/100</span>
        </div>
      </div>

      {/* Code lines */}
      <div className="overflow-auto max-h-[550px] font-mono text-sm">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const issue = issuesByLine[lineNum];
              return (
                <tr
                  key={lineNum}
                  className={`group hover:bg-white/5 transition-colors ${
                    issue ? severityStyle[issue.severity] : ''
                  }`}
                  title={issue ? issue.message : ''}
                >
                  {/* Line number */}
                  <td className="select-none px-3 py-0.5 text-gray-600 text-right w-12 border-r border-gray-800/50">
                    {lineNum}
                  </td>
                  {/* Issue indicator */}
                  <td className="w-5 px-1 text-center">
                    {issue && (
                      <span title={issue.message} className="cursor-help">
                        {issue.severity === 'critical' ? '🔴' :
                         issue.severity === 'warning'  ? '🟡' : '🔵'}
                      </span>
                    )}
                  </td>
                  {/* Code */}
                  <td className="px-3 py-0.5 text-gray-200 whitespace-pre">
                    {line || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
        <span>🔴 Critical</span>
        <span>🟡 Warning</span>
        <span>🔵 Info</span>
        <span className="ml-auto">{file.issues?.length || 0} issues found</span>
      </div>
    </div>
  );
}