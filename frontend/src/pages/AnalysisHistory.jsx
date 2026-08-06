import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { History, Search, GitCompare, ArrowUpRight, FileText, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await analysisAPI.getHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Fetch history error:', err);
      toast.error('Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 2) {
        toast.error('You can compare maximum 2 analyses at a time.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompareTrigger = () => {
    if (selectedIds.length !== 2) {
      toast.error('Select exactly 2 analyses to compare.');
      return;
    }
    navigate(`/compare?id1=${selectedIds[0]}&id2=${selectedIds[1]}`);
  };

  const filteredHistory = history.filter(item => 
    item.jobId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.resumeId?.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" />
            <span>Analysis Cloud History</span>
          </h1>
          <p className="text-xs text-slate-400">All saved resume & job match evaluation runs</p>
        </div>

        {selectedIds.length === 2 && (
          <button
            onClick={handleCompareTrigger}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/25 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Selected Versions</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by job title or resume filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* History Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Fetching analysis history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs">No analysis records found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 w-10">Select</th>
                  <th className="px-4 py-3.5">Job Title</th>
                  <th className="px-4 py-3.5">Resume File</th>
                  <th className="px-4 py-3.5">ATS Score</th>
                  <th className="px-4 py-3.5">Semantic Match</th>
                  <th className="px-4 py-3.5">Readiness</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleSelect(item._id)}
                        className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-white">
                      {item.jobId?.title || 'Target Job Role'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {item.resumeId?.originalFilename || 'Resume.pdf'} (v{item.resumeId?.version || 1})
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-sky-400">
                      {item.atsScore}%
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-400">
                      {item.semanticSimilarity}%
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {item.shortlistReadiness}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/analysis/${item._id}`}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-medium border border-sky-500/20 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
