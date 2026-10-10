import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  BarChart3,
  RefreshCw,
  FolderOpen,
  ArrowUpRight,
  Layers,
  Settings,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { CaseDetail, DashboardMetrics } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface StaffDashboardPageProps {
  onOpenCase: (caseId: string) => void;
  onNavigateToAdmin: () => void;
}

const COLORS = ['#00ADB5', '#2563EB', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#64748B'];

export const StaffDashboardPage: React.FC<StaffDashboardPageProps> = ({
  onOpenCase,
  onNavigateToAdmin,
}) => {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        api.getMetrics(),
        api.getCases({
          search,
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter,
          page,
          limit: 20,
        }),
      ]);
      setMetrics(m);
      setCases(c.cases);
      setTotalCases(c.total);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, categoryFilter, priorityFilter, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white">Campus Safety Incident Command</h1>
            <span className="text-xs bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
              Live Gateway
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong> ({user?.department})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Realtime Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Admin Console</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0F1D38] border border-blue-900/60 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Total Allegations</span>
            <div className="text-2xl font-bold text-white">{metrics.totalCases}</div>
            <span className="text-[10px] text-slate-500">Persistent in DB</span>
          </div>

          <div className="bg-[#0F1D38] border border-blue-900/60 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-blue-300 block font-medium">Newly Submitted</span>
            <div className="text-2xl font-bold text-blue-400">{metrics.submittedCases}</div>
            <span className="text-[10px] text-blue-500/80">Pending triage</span>
          </div>

          <div className="bg-[#0F1D38] border border-amber-900/40 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-amber-300 block font-medium">Under Review</span>
            <div className="text-2xl font-bold text-amber-400">{metrics.underReviewCases}</div>
            <span className="text-[10px] text-amber-500/80">Active investigation</span>
          </div>

          <div className="bg-[#0F1D38] border border-red-900/40 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-red-300 block font-medium">High / Critical</span>
            <div className="text-2xl font-bold text-red-400">{metrics.highOrCriticalPriority}</div>
            <span className="text-[10px] text-red-500/80">Fast-track response</span>
          </div>

          <div className="bg-[#0F1D38] border border-orange-900/40 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-orange-300 block font-medium">Action Needed</span>
            <div className="text-2xl font-bold text-orange-400">{metrics.additionalInfoRequested}</div>
            <span className="text-[10px] text-orange-500/80">Awaiting reporter info</span>
          </div>

          <div className="bg-[#0F1D38] border border-emerald-900/40 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-emerald-300 block font-medium">Resolved / Closed</span>
            <div className="text-2xl font-bold text-emerald-400">{metrics.resolvedCases}</div>
            <span className="text-[10px] text-emerald-500/80">Takedowns completed</span>
          </div>
        </div>
      )}

      {/* CHARTS ROW */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span>Incident Category Distribution</span>
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.byCategory}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E3E62', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#00ADB5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Social Media Platform Breakdown</span>
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.byPlatform}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E3E62', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Case ID, keyword, handle, platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ADDITIONAL_INFO_REQUESTED">Additional Info Needed</option>
              <option value="ACTION_IN_PROGRESS">Action in Progress</option>
              <option value="REFERRED_TO_AUTHORITY">Referred to Authority</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="ALL">All Categories</option>
              <option value="FAKE_PROFILE">Fake Profile</option>
              <option value="CYBERBULLYING">Cyberbullying</option>
              <option value="IMPERSONATION">Impersonation</option>
              <option value="ONLINE_HARASSMENT">Harassment</option>
              <option value="THREATS">Threats</option>
              <option value="CYBERSTALKING">Stalking</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* CASES DATA TABLE */}
      <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Officer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    Loading incident cases from database...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-600" />
                    <div>No cases found matching your filters.</div>
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-950/30 transition cursor-pointer"
                    onClick={() => onOpenCase(c.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-300 whitespace-nowrap">
                      {c.id}
                      {c.isImmediateDanger && (
                        <span className="ml-2 text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-700 font-sans">
                          DANGER
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{c.category.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4">{c.platform}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : c.priority === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : c.priority === 'MEDIUM'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.assignedOfficer ? c.assignedOfficer.name : <em className="text-slate-500">Unassigned</em>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCase(c.id);
                        }}
                        className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-teal-300 rounded-lg text-[11px] font-semibold border border-teal-500/30 transition inline-flex items-center space-x-1"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
