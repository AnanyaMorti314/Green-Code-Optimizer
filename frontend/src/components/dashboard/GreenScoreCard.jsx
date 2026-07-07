import { downloadPDF } from '../../utils/pdfExport';

const gradeColors = {
  'A+': '#22c55e', 'A': '#4ade80', 'B': '#86efac',
  'C': '#fbbf24', 'D': '#f97316', 'F': '#ef4444'
};

export default function GreenScoreCard({ analysis }) {
  const score = analysis.overallScore;
  const circumference = 283;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-gray-300">Overall Green Score</h2>

      {/* SVG ring */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={gradeColors[analysis.grade] || '#22c55e'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-sm text-gray-400">/ 100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        className="text-2xl font-black px-5 py-1 rounded-full"
        style={{ background: gradeColors[analysis.grade] + '20', color: gradeColors[analysis.grade] }}
      >
        Grade {analysis.grade}
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-3 mt-2">
        <div className="bg-gray-900 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">CO₂ / run</div>
          {/* <div className="text-lg font-bold text-orange-400">{analysis.totalCo2.toFixed(4)}g</div> */}
          <div className="text-lg font-bold text-orange-400">
            {analysis.totalCo2 < 0.0001
              ? analysis.totalCo2.toExponential(2)   // shows: 4.2e-6
              : analysis.totalCo2 < 0.01
                ? analysis.totalCo2.toFixed(6)          // shows: 0.000042
                : analysis.totalCo2.toFixed(4)          // shows: 0.0234
            }g
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Files</div>
          <div className="text-lg font-bold text-blue-400">{analysis.files.length}</div>
        </div>
      </div>

      {/* Download PDF */}
      <button
        onClick={() => downloadPDF(analysis)}
        className="w-full mt-2 bg-green-600/20 hover:bg-green-600/40 border border-green-600/30 text-green-400 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        ⬇ Download PDF Report
      </button>
    </div>
  );
}