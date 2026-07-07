import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { analysisService } from '../services/analysis.service';
import { Trash2, Eye, Calendar, Leaf } from 'lucide-react';

const gradeColor = {
  'A+': 'text-green-400', 'A': 'text-green-400', 'B': 'text-lime-400',
  'C': 'text-yellow-400', 'D': 'text-orange-400', 'F': 'text-red-400'
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analysisService.getHistory().then(res => {
      setHistory(res.data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    await analysisService.deleteAnalysis(id);
    setHistory(h => h.filter(x => x._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Leaf className="text-green-400 w-6 h-6" />
          <h1 className="text-2xl font-bold">Analysis History</h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : history.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-500">
            <div className="text-5xl mb-4">📂</div>
            <p>No analyses yet. Upload your first code file!</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-500 transition"
            >
              Analyze Code
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div key={item._id} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition cursor-pointer"
                onClick={() => navigate(`/dashboard?id=${item._id}`)}>
                {/* Score */}
                <div className="w-16 h-16 rounded-xl bg-gray-900 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{item.overallScore}</span>
                  <span className={`text-xs font-bold ${gradeColor[item.grade] || 'text-gray-400'}`}>{item.grade}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{item.projectName}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span>{item.files?.length || 0} file(s)</span>
                    <span className="text-orange-400">CO₂: {item.totalCo2?.toFixed(4)}g</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard?id=${item._id}`)}
                    className="p-2 text-gray-500 hover:text-blue-400 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={e => handleDelete(item._id, e)} className="p-2 text-gray-500 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}