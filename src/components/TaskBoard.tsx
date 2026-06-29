import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, Clock, Brain, User, AlertTriangle, Play, Trash2, Calendar, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Task, TeamMember, Priority, TaskStatus } from "../types";

interface TaskBoardProps {
  tasks: Task[];
  members: TeamMember[];
  onAddTask: (taskData: Omit<Task, "id" | "createdAt" | "aiAssessment">) => Promise<void>;
  onUpdateTask: (id: string, fields: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onTriggerAIPrioritize: () => Promise<void>;
}

export default function TaskBoard({
  tasks,
  members,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onTriggerAIPrioritize,
}: TaskBoardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "All">("All");
  const [aiLoading, setAiLoading] = useState(false);
  
  // New task form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || "");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Task title is required.");
      return;
    }
    setFormError("");
    await onAddTask({
      title,
      description,
      assigneeId,
      priority,
      dueDate,
      status: "Pending"
    });
    // Reset Form
    setTitle("");
    setDescription("");
    setIsFormOpen(false);
  };

  const handleAITriage = async () => {
    setAiLoading(true);
    try {
      await onTriggerAIPrioritize();
    } finally {
      setAiLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => filterStatus === "All" || t.status === filterStatus);

  // Priority UI styles helper
  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case "Critical":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "High":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Medium":
        return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "Low":
        return "bg-slate-500/10 border-slate-500/20 text-slate-400";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  // Status helper
  const getStatusIcon = (status: TaskStatus, id: string) => {
    switch (status) {
      case "Completed":
        return (
          <button
            id={`task-status-btn-pending-${id}`}
            onClick={() => onUpdateTask(id, { status: "Pending" })}
            className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-pointer hover:bg-slate-800 transition-all"
            title="Mark as Pending"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        );
      case "In Progress":
        return (
          <button
            id={`task-status-btn-completed-${id}`}
            onClick={() => onUpdateTask(id, { status: "Completed" })}
            className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 cursor-pointer hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
            title="Mark as Completed"
          >
            <Play className="h-3 w-3 animate-pulse" />
          </button>
        );
      default:
        return (
          <button
            id={`task-status-btn-inprogress-${id}`}
            onClick={() => onUpdateTask(id, { status: "In Progress" })}
            className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 border border-white/10 text-slate-400 cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
            title="Mark as In Progress"
          >
            <div className="h-2 w-2 rounded-full bg-slate-500" />
          </button>
        );
    }
  };

  return (
    <div id="task-board-container" className="space-y-6">
      
      {/* Action Header bar */}
      <div id="task-board-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Filters tab */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1 font-mono uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {(["All", "Pending", "In Progress", "Completed"] as const).map((status) => (
            <button
              id={`filter-btn-${status}`}
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all shrink-0 ${
                filterStatus === status
                  ? "bg-violet-600 text-white"
                  : "bg-slate-900/60 border border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Buttons Action Group */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="ai-triage-btn"
            onClick={handleAITriage}
            disabled={aiLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 px-4 py-2 text-xs font-bold text-white transition-all glow-cyan active:scale-95 disabled:opacity-50"
          >
            <Brain className={`h-4 w-4 ${aiLoading ? "animate-spin" : ""}`} />
            {aiLoading ? "Gemini Triaging..." : "Triage with Gemini AI"}
          </button>

          <button
            id="add-task-toggle-btn"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/25 px-4 py-2 text-xs font-bold text-slate-100 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Slide down Create Task Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            id="add-task-form-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden glass-panel rounded-xl"
          >
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" /> Draft New Project Task
              </h3>
              
              {formError && <p className="text-xs text-rose-400 font-medium">{formError}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold uppercase tracking-wider text-slate-400">Task Title</label>
                  <input
                    id="new-task-title-input"
                    type="text"
                    placeholder="e.g. Build API integration backend"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500 px-3 py-2 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-bold uppercase tracking-wider text-slate-400">Assign To Team Member</label>
                  <select
                    id="new-task-assignee-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500 px-3 py-2 text-sm text-slate-200 outline-none transition-all"
                  >
                    {members.map(member => (
                      <option key={member.id} value={member.id} className="bg-slate-900 text-slate-200">
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold uppercase tracking-wider text-slate-400">Task Description</label>
                <textarea
                  id="new-task-desc-textarea"
                  rows={2}
                  placeholder="Explain requirements, testing criteria, and final deliverable expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500 px-3 py-2 text-sm text-slate-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold uppercase tracking-wider text-slate-400">Priority Tier</label>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High", "Critical"] as const).map((p) => (
                      <button
                        id={`priority-select-btn-${p}`}
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold tracking-wide transition-all ${
                          priority === p
                            ? "bg-white/10 border-white text-white font-bold"
                            : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-bold uppercase tracking-wider text-slate-400">Due Deadline</label>
                  <input
                    id="new-task-date-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-2 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  id="task-form-cancel-btn"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg bg-slate-900 border border-white/5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="task-form-submit-btn"
                  type="submit"
                  className="rounded-lg bg-violet-600 hover:bg-violet-500 px-5 py-2 text-xs font-bold text-white transition-all shadow-lg"
                >
                  Confirm & Add
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks listing list */}
      <div id="tasks-list-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <div id="empty-tasks-alert" className="col-span-full flex flex-col items-center justify-center p-12 glass-panel rounded-xl text-center">
              <CheckCircle2 className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm font-bold text-white">No tasks matching filters</p>
              <p className="text-xs text-slate-400 mt-1">Check another filter status or click 'Add Task' to create a new backlog item.</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => {
              const assignee = members.find(m => m.id === task.assigneeId);
              
              return (
                <motion.div
                  id={`task-card-${task.id}`}
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`relative overflow-hidden rounded-xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between ${
                    task.status === "Completed"
                      ? "bg-slate-900/35 border-white/5 opacity-80"
                      : "bg-slate-900/50 border-white/10 hover:border-white/20 glow-violet"
                  }`}
                >
                  {/* Priority bar indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    task.priority === "Critical" ? "bg-rose-500" :
                    task.priority === "High" ? "bg-amber-500" :
                    task.priority === "Medium" ? "bg-cyan-500" : "bg-slate-500"
                  }`} />

                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* Interactive complete status circle */}
                        {getStatusIcon(task.status, task.id)}
                        <h4 className={`text-sm font-bold tracking-tight text-white ${task.status === "Completed" ? "line-through text-slate-400" : ""}`}>
                          {task.title}
                        </h4>
                      </div>
                      
                      <button
                        id={`delete-task-btn-${task.id}`}
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer rounded transition-all hover:bg-slate-800"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Desc */}
                    <p className="mt-2 text-xs leading-relaxed text-slate-300 font-normal">
                      {task.description || "No specific detailed description provided for this backlog ticket."}
                    </p>

                    {/* AI Assessment Glow Box */}
                    {task.aiAssessment && (
                      <div className="mt-3 rounded-lg bg-cyan-950/20 border border-cyan-500/10 p-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1">
                          <Sparkles className="h-3 w-3 text-cyan-400/60" />
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <div className="text-3xs font-mono font-medium text-cyan-400 leading-relaxed uppercase tracking-wider">
                            Gemini Assessment
                          </div>
                        </div>
                        <p className="mt-1 text-2xs text-slate-300 font-sans leading-normal font-medium">
                          {task.aiAssessment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer details row */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 border rounded-md px-2 py-0.5 text-3xs font-semibold tracking-wider uppercase font-mono ${getPriorityBadge(task.priority)}`}>
                        {task.priority === "Critical" && <AlertTriangle className="h-2.5 w-2.5" />}
                        {task.priority}
                      </span>

                      <span className="flex items-center gap-1 text-3xs text-slate-400 font-mono">
                        <Calendar className="h-3 w-3" /> {task.dueDate}
                      </span>
                    </div>

                    {/* Assignee pill */}
                    {assignee ? (
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-2.5 py-0.5 max-w-[150px] truncate" title={`${assignee.name} (${assignee.role})`}>
                        <div className={`h-4.5 w-4.5 rounded-full bg-gradient-to-tr ${assignee.avatarColor} text-white text-3xs font-bold flex items-center justify-center shrink-0`}>
                          {assignee.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-3xs text-slate-300 truncate font-medium">
                          {assignee.name.split(" ")[0]}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-3xs text-slate-400">
                        <User className="h-3 w-3" /> Unassigned
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
