import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCode, Loader2, AlertCircle } from 'lucide-react';

const SUPPORTED = ['.py', '.java', '.c', '.cpp', '.zip'];

export default function UploadZone({ onUpload, loading, error }) {
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python':   ['.py'],
      'text/x-java':     ['.java'],
      'text/x-csrc':     ['.c'],
      'text/x-c++src':   ['.cpp', '.cc', '.cxx'],
      'application/zip': ['.zip'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyze = () => {
    if (file) onUpload(file, projectName);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Analyze Your Code</h2>
        <p className="text-gray-400">Upload a code file or ZIP archive to get your Green Score and CO₂ analysis</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
          isDragActive ? 'border-green-500 bg-green-500/5' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-green-400">
            <FileCode className="w-5 h-5" />
            <span className="font-medium">{file.name}</span>
            <span className="text-gray-500 text-sm">({(file.size/1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <>
            <p className="text-lg text-gray-300 mb-2">Drop your code file here</p>
            <p className="text-sm text-gray-500">Supports: {SUPPORTED.join(', ')} • Max 10MB</p>
          </>
        )}
      </div>

      {/* Project name */}
      <input
        type="text"
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        placeholder="Project name (optional)"
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
      />

      {/* Error */}
      {error && (
        <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
        ) : (
          <><span>🌿</span> Analyze Green Score</>
        )}
      </button>

      {/* Language badges */}
      <div className="flex gap-2 justify-center flex-wrap">
        {['Python', 'Java', 'C', 'C++'].map(lang => (
          <span key={lang} className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
}