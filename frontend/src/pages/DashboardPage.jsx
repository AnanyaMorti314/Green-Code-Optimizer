import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import UploadZone from '../components/dashboard/UploadZone';
import GreenScoreCard from '../components/dashboard/GreenScoreCard';
import AnalysisReport from '../components/dashboard/AnalysisReport';
import CodeViewer from '../components/dashboard/CodeViewer';
import SuggestionPanel from '../components/dashboard/SuggestionPanel';
import { analysisService } from '../services/analysis.service';
import { Leaf, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [activeFile, setActiveFile] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Load existing analysis if ?id= is in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setLoading(true);
      setError('');
      analysisService.getAnalysis(id)
        .then(res => {
          setAnalysis(res.data);
          setActiveFile(0);
        })
        .catch(() => setError('Failed to load analysis report.'))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handleUpload = async (file, projectName) => {
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const res = await analysisService.uploadCode(file, projectName);
      setAnalysis(res.data);
      setActiveFile(0);
      // Update URL without reload
      setSearchParams({ id: res.data._id });
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError('');
    setSearchParams({});  // clear ?id= from URL
  };

  const currentFile = analysis?.files?.[activeFile];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Leaf className="text-green-400 w-6 h-6" />
          <h1 className="text-2xl font-bold">Code Analysis Dashboard</h1>
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
            <p className="text-gray-400">Analyzing your code...</p>
          </div>
        )}

        {/* Upload zone — show when not loading and no analysis */}
        {!loading && !analysis && (
          <UploadZone onUpload={handleUpload} loading={loading} error={error} />
        )}

        {/* Analysis results */}
        {!loading && analysis && (
          <div className="space-y-6">

            {/* Top row: score + report */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GreenScoreCard analysis={analysis} />
              <div className="lg:col-span-2">
                <AnalysisReport analysis={analysis} />
              </div>
            </div>

            {/* File tabs — only show if multiple files */}
            {analysis.files.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {analysis.files.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFile(i)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      i === activeFile
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {f.filename.split('/').pop()}
                    {f.issues?.length > 0 && (
                      <span className="ml-2 bg-red-500/30 text-red-400 text-xs px-1.5 rounded-full">
                        {f.issues.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Code viewer + suggestions */}
            {currentFile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CodeViewer file={currentFile} />
                </div>
                <SuggestionPanel issues={currentFile.issues} />
              </div>
            )}

            {/* Reset button */}
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-300 text-sm underline"
            >
              ← Analyze another project
            </button>
          </div>
        )}

      </main>
    </div>
  );
}