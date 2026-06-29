import React, { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Calendar, FileText, Brain, Sparkles, RefreshCw, BarChart2 } from "lucide-react";
import { Task, Meeting, Document, TeamMember } from "../types";

interface DashboardOverviewProps {
  tasks: Task[];
  meetings: Meeting[];
  documents: Document[];
  members: TeamMember[];
  aiInsights: string;
  onRefreshInsights: () => Promise<void>;
}

export default function DashboardOverview({
  tasks,
  meetings,
  documents,
  members,
  aiInsights,
  onRefreshInsights,
}: DashboardOverviewProps) {
  const [loading, setLoading] = useState(false);

  // Stats Calculations
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const criticalTasks = tasks.filter((t) => t.priority === "Critical" && t.status !== "Completed").length;

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefreshInsights();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="dashboard-overview-container" className="space-y-6">
      {/* AI Executive Insights Banner */}
      <motion.div
        id="ai-insights-banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-violet-950/40 p-6 backdrop-blur-xl glow-cyan"
      >
        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div id="ai-icon-bg" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Brain className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">Gemini Smart AI Suggestions</h2>
                <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-2xs font-medium text-cyan-400">
                  <Sparkles className="h-3 w-3" /> Live Triage
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300 font-sans">
                {aiInsights || "Awaiting workplace analysis. Click 'Compile insights' to trigger real-time workspace optimization recommendations."}
              </p>
            </div>
          </div>
          
          <button
            id="refresh-insights-btn"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 self-start md:self-center rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 px-4 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-cyan-500/10 hover:text-cyan-400 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Re-Analyzing..." : "Analyze Sprint"}
          </button>
        </div>
      </motion.div>

      {/* Grid counters */}
      <div id="stats-counter-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Task Completion Progress */}
        <motion.div
          id="stat-card-task-completion"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass-panel glass-card-hover rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sprint Progress</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{completionPercentage}%</span>
            <span className="text-xs text-slate-400">({completedTasks}/{totalTasks} tasks)</span>
          </div>
          
          {/* Custom Animated Progress Bar */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              id="task-progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
          
          <div className="mt-2.5 flex items-center justify-between text-2xs text-slate-400 font-mono">
            <span>{pendingTasks} Pending</span>
            <span>{inProgressTasks} Active</span>
          </div>
        </motion.div>

        {/* Card 2: Upcoming Schedules */}
        <motion.div
          id="stat-card-schedules"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-panel glass-card-hover rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meetings Block</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{meetings.length}</span>
            <span className="text-xs text-slate-400">Scheduled Syncs</span>
          </div>
          
          <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 bg-violet-500/5 border border-violet-500/10 rounded-lg px-2.5 py-1.5 font-sans">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
            <span className="truncate font-medium text-2xs">
              Next: {meetings[0] ? `${meetings[0].title} (${meetings[0].time})` : "No syncs planned"}
            </span>
          </div>
        </motion.div>

        {/* Card 3: Active Documents */}
        <motion.div
          id="stat-card-documents"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-panel glass-card-hover rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knowledge Base</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{documents.length}</span>
            <span className="text-xs text-slate-400">Collaborative Docs</span>
          </div>

          <div className="mt-4 flex items-center justify-between text-2xs text-slate-400 font-mono border-t border-white/5 pt-3">
            <span>Last update:</span>
            <span className="text-cyan-400 font-medium truncate max-w-[120px]">
              {documents[0] ? documents[0].title : "N/A"}
            </span>
          </div>
        </motion.div>

        {/* Card 4: Critical Items */}
        <motion.div
          id="stat-card-critical-issues"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-panel glass-card-hover rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Backlogs</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <BarChart2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${criticalTasks > 0 ? "text-rose-400 animate-pulse" : "text-white"}`}>
              {criticalTasks}
            </span>
            <span className="text-xs text-slate-400">Unresolved Threats</span>
          </div>

          <div className="mt-4 flex items-center justify-between text-2xs text-slate-400 font-mono border-t border-white/5 pt-3">
            <span>Status:</span>
            <span className={`font-semibold ${criticalTasks > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {criticalTasks > 0 ? "Action Required" : "System Balanced"}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
