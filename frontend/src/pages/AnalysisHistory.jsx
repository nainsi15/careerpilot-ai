import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analysisAPI } from '../services/api';
import { History, Search, GitCompare, ArrowUpRight, FileText } from 'lucide-react';
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
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
            <History className="w-6 h-6 text-[#3B82F6]" />
            <span>Analysis Cloud History</span>
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-slate-400">All saved resume & job match evaluation runs</p>
        </div>

        {selectedIds.length === 2 && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleCompareTrigger}
            className="btn-primary text-xs font-semibold flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Selected Versions</span>
          </motion.button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280] dark:text-slate-500" />
        <input
          type="text"
          placeholder="Filter by job title or resume filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="saas-input w-full pl-10 pr-4 py-2.5 text-xs"
        />
      </div>

      {/* History Table */}
      <div className="linear-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#6B7280] space-y-2">
            <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Fetching analysis history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-[#6B7280] space-y-2">
            <FileText className="w-8 h-8 text-[#6B7280] mx-auto" />
            <p className="text-xs">No analysis records found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#374151] dark:text-slate-300">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1220] text-[#4B5563] dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E7EB] dark:border-white/[0.06]">
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
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F9FAFB] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleSelect(item._id)}
                        className="rounded border-[#D1D5DB] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#3B82F6] focus:ring-[#3B82F6]"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#111827] dark:text-slate-100">
                      {item.jobId?.title || 'Target Job Role'}
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280] dark:text-slate-400">
                      {item.resumeId?.originalFilename || 'Resume.pdf'} (v{item.resumeId?.version || 1})
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#3B82F6]">
                      {item.atsScore}%
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#22C55E]">
                      {item.semanticSimilarity}%
                    </td>
                    <td className="px-4 py-3.5 text-[#374151] dark:text-slate-300">
                      {item.shortlistReadiness}
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280] dark:text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/analysis/${item._id}`}
                        className="px-3 py-1.5 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 text-xs font-semibold border border-[#3B82F6]/20 inline-flex items-center gap-1 transition-colors"
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
