import { CheckCircle, AlertTriangle, XCircle, Cpu, MemoryStick, Zap } from 'lucide-react';

const MetricBar = ({ label, value, max, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs text-gray-400">
      <span>{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  </div>
);

export default function AnalysisReport({ analysis }) {
  const criticalCount = analysis.files.reduce(
    (sum, f) => sum + (f.issues?.filter(i => i.severity === 'critical').length || 0), 0
  );
  const warningCount = analysis.files.reduce(
    (sum, f) => sum + (f.issues?.filter(i => i.severity === 'warning').length || 0), 0
  );
  const infoCount = analysis.files.reduce(
    (sum, f) => sum + (f.issues?.filter(i => i.severity === 'info').length || 0), 0
  );

  // Average metrics across all files
  const avgMetrics = analysis.files.reduce((acc, f) => {
    const m = f.metrics || {};
    acc.complexity  += (m.cyclomaticComplexity || 0);
    acc.nestedLoops += (m.nestedLoopDepth || 0);
    acc.ioOps       += (m.ioOperations || 0);
    acc.memory      += (m.memoryAllocations || 0);
    return acc;
  }, { complexity: 0, nestedLoops: 0, ioOps: 0, memory: 0 });

  const n = analysis.files.length || 1;
  const metrics = {
    complexity:  Math.round(avgMetrics.complexity  / n),
    nestedLoops: Math.round(avgMetrics.nestedLoops / n),
    ioOps:       Math.round(avgMetrics.ioOps       / n),
    memory:      Math.round(avgMetrics.memory      / n),
  };

  return (
    <div className="glass rounded-2xl p-6 h-full space-y-5">
      <h2 className="text-lg font-semibold text-gray-300">Analysis Summary</h2>

      {/* Issue counts */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-xs text-gray-500">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-orange-400">{warningCount}</div>
          <div className="text-xs text-gray-500">Warnings</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <CheckCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-400">{infoCount}</div>
          <div className="text-xs text-gray-500">Info</div>
        </div>
      </div>

      {/* Metrics bars */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Code Metrics</p>
        <MetricBar label="Cyclomatic Complexity" value={metrics.complexity}  max={30} color="bg-purple-500" />
        <MetricBar label="Max Nested Loop Depth" value={metrics.nestedLoops} max={5}  color="bg-red-500" />
        <MetricBar label="I/O Operations"         value={metrics.ioOps}       max={50} color="bg-yellow-500" />
        <MetricBar label="Memory Allocations"     value={metrics.memory}      max={100} color="bg-blue-500" />
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Top Recommendations</p>
          <ul className="space-y-2">
            {analysis.recommendations.slice(0, 3).map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-0.5 flex-shrink-0">✦</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

//

// ## All Missing Files Checklist

// Check your folder has **all these files** created — these are all the ones the guide mentioned but you need to create manually:
// 
// src/
// ├── pages/
// │   ├── LoginPage.jsx        ✅ (from guide)
// │   ├── RegisterPage.jsx     ← paste above  ✅
// │   ├── DashboardPage.jsx    ✅ (from guide)
// │   └── HistoryPage.jsx      ✅ (from guide)
// │
// └── components/
//     └── dashboard/
//         ├── UploadZone.jsx       ✅ (from guide)
//         ├── GreenScoreCard.jsx   ✅ (from guide)
//         ├── AnalysisReport.jsx   ← paste above  ✅
//         ├── CodeViewer.jsx       ✅ (from guide)
//         └── SuggestionPanel.jsx  ✅ (from guide)