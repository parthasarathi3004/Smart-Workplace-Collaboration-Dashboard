import React from "react";
import { motion } from "motion/react";
import { Users, BarChart3, TrendingUp, AlertCircle, ShieldAlert, CheckSquare } from "lucide-react";
import { TeamMember, Task } from "../types";

interface TeamAnalyticsProps {
  members: TeamMember[];
  tasks: Task[];
}

export default function TeamAnalytics({ members, tasks }: TeamAnalyticsProps) {
  // Find highest active tasks member
  const sortedByWorkload = [...members].sort((a, b) => b.activeTasksCount - a.activeTasksCount);
  const mostBusyMember = sortedByWorkload[0];

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const activeTasks = tasks.filter(t => t.status !== "Completed").length;

  // Find max task count to normalize bar charts
  const maxCompleted = Math.max(...members.map(m => m.completedTasksCount), 1);
  const maxActive = Math.max(...members.map(m => m.activeTasksCount), 1);

  return (
    <div id="team-analytics-container" className="space-y-6">
      
      {/* Overview Info Boxes */}
      <div id="analytics-summary-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Most Busy Member box */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 bg-rose-500/10 rounded-full blur-xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Workload Peak</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {mostBusyMember ? mostBusyMember.name : "N/A"}
            </div>
            <div className="text-xs text-rose-400 font-medium mt-0.5">
              {mostBusyMember ? `${mostBusyMember.activeTasksCount} active tasks (${mostBusyMember.role})` : "Balanced"}
            </div>
          </div>
        </div>

        {/* Dynamic Velocity rate box */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Velocity Rate</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% Completed` : "0% Completed"}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              {completedTasks} completed / {activeTasks} active tasks
            </div>
          </div>
        </div>

        {/* Total team size */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 bg-violet-500/10 rounded-full blur-xl" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono">Team Power</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {members.length} Core Engineers
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Operating at full capability
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Panel */}
      <div id="analytics-charts-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom SVG Bar Chart - Workload and completed tasks */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Workload Distribution Matrix</h3>
            </div>
            <div className="flex gap-4 text-2xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded bg-emerald-400 inline-block" /> Completed Tasks
              </span>
              <span className="flex items-center gap-1.5 text-violet-400">
                <span className="h-2 w-2 rounded bg-violet-500 inline-block" /> Active Tasks
              </span>
            </div>
          </div>

          {/* Members Bar Chart Grid */}
          <div className="space-y-4 pt-2">
            {members.map((member) => {
              // Calculate percentage widths for bar graph
              const completedPercent = (member.completedTasksCount / maxCompleted) * 100;
              const activePercent = (member.activeTasksCount / maxActive) * 100;

              return (
                <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-5 last:border-0 last:pb-0">
                  
                  {/* Avatar & Name (Fixed Width for Perfect Alignment) */}
                  <div className="flex items-center gap-3.5 shrink-0 md:w-56">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-tr ${member.avatarColor} text-white font-extrabold text-xs flex items-center justify-center border border-white/10 shrink-0 shadow-sm`}>
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate tracking-tight">{member.name}</div>
                      <div className="text-3xs text-slate-400 font-mono tracking-wider truncate mt-0.5 uppercase">{member.role}</div>
                    </div>
                  </div>

                  {/* Progressive Bar meters side by side */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active Tasks Bar */}
                    <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-white/5 shadow-sm">
                      <div className="flex justify-between items-center text-3xs font-mono uppercase tracking-wider">
                        <span className="text-slate-400 font-medium">Active Queue</span>
                        <span className="text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                          {member.activeTasksCount} tasks
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden relative border border-white/5">
                        <motion.div
                          id={`member-active-bar-${member.id}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${activePercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Completed Tasks Bar */}
                    <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-white/5 shadow-sm">
                      <div className="flex justify-between items-center text-3xs font-mono uppercase tracking-wider">
                        <span className="text-slate-400 font-medium">Past Accomplishments</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {member.completedTasksCount} items
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden relative border border-white/5">
                        <motion.div
                          id={`member-completed-bar-${member.id}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${completedPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Member Standings / Efficiency stats */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <CheckSquare className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Workload Advice</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950/40 border border-white/5 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider font-mono text-2xs">
                <AlertCircle className="h-4 w-4 text-amber-400" /> Bottleneck Alert
              </div>
              <p className="text-slate-300 leading-normal">
                Backend Lead <strong className="text-white">Vikram Ram</strong> is currently holding 4 pending tickets. Product management should delegate any slow query diagnostic support roles to Lead Architect <strong className="text-white">Adhithya Vardhan</strong> to maintain velocity.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400">Efficiency Rankings</h4>
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-3xs font-mono text-slate-500 w-4">#0{i+1}</span>
                    <span className="text-slate-300 font-medium">{m.name}</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5 text-2xs">
                    {m.completedTasksCount} resolved
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
