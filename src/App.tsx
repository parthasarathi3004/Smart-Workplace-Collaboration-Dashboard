import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckSquare, Calendar, FileText, Users, Activity, Sun, Moon, Sparkle, RefreshCw } from "lucide-react";

import { Task, Meeting, Document, TeamMember, DashboardData, DocCategory } from "./types";
import DashboardOverview from "./components/DashboardOverview";
import TaskBoard from "./components/TaskBoard";
import MeetingScheduler from "./components/MeetingScheduler";
import DocumentCollab from "./components/DocumentCollab";
import TeamAnalytics from "./components/TeamAnalytics";
import WorkplaceCopilot from "./components/WorkplaceCopilot";

export default function App() {
  const [activeTab, setActiveTab] = useState<"Overview" | "Tasks" | "Meetings" | "Docs" | "Analytics">("Overview");
  const [direction, setDirection] = useState<number>(0); // 1 = slide right (forward), -1 = slide left (backward)
  const tabsOrder = ["Overview", "Tasks", "Meetings", "Docs", "Analytics"] as const;

  const handleTabChange = (newTab: "Overview" | "Tasks" | "Meetings" | "Docs" | "Analytics") => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    const newIndex = tabsOrder.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const [data, setData] = useState<DashboardData>({
    tasks: [],
    meetings: [],
    documents: [],
    members: [],
    aiInsights: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [darkMode, setDarkMode] = useState(true); // default to beautiful dark theme

  // Fetch Dashboard state from Express REST endpoints
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to contact the workplace registry server.");
      const payload: DashboardData = await res.json();
      setData(payload);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Unable to synchronize with workspace services. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Action: Add Task
  const handleAddTask = async (taskData: Omit<Task, "id" | "createdAt" | "aiAssessment">) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error("Error submitting task parameters.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to register new task: " + err.message);
    }
  };

  // Action: Update Task (Complete, etc)
  const handleUpdateTask = async (id: string, fields: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Error updating task records.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to synchronize task updates: " + err.message);
    }
  };

  // Action: Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error removing task from registry.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to remove task: " + err.message);
    }
  };

  // Action: Add Meeting Block
  const handleAddMeeting = async (meetingData: Omit<Meeting, "id" | "joinLink">) => {
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });
      if (!res.ok) throw new Error("Error writing calendar blocking guidelines.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to block meeting slot: " + err.message);
    }
  };

  // Action: Delete Meeting Block
  const handleDeleteMeeting = async (id: string) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error removing meeting slot from registry.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to remove meeting slot: " + err.message);
    }
  };

  // Action: Create Document summary
  const handleAddDocument = async (docData: { title: string; category: DocCategory; content: string; authorName: string }) => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docData),
      });
      if (!res.ok) throw new Error("Error registering document metadata.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to draft document: " + err.message);
    }
  };

  // Action: Delete Document
  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error removing document from registry.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to remove document: " + err.message);
    }
  };

  // Action: Add Comment to Document
  const handleAddComment = async (docId: string, authorName: string, text: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, text }),
      });
      if (!res.ok) throw new Error("Error submitting team comment feed.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Failed to publish comment: " + err.message);
    }
  };

  // Action: Trigger AI Tasks Prioritizer via Gemini API
  const handleTriggerAIPrioritize = async () => {
    try {
      const res = await fetch("/api/ai/prioritize", { method: "POST" });
      if (!res.ok) throw new Error("Error executing Gemini prioritiser schema.");
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg("Gemini Task Triage failed: " + err.message);
    }
  };

  // Action: Regenerate AI workspace-wide executive insights
  const handleRefreshInsights = async () => {
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      if (!res.ok) throw new Error("Error requesting Gemini executive analytics compiler.");
      const updated = await res.json();
      setData((prev) => ({ ...prev, aiInsights: updated.insights }));
    } catch (err: any) {
      setErrorMsg("Gemini insights compiler failed: " + err.message);
    }
  };

  // Action: Send Query to embedded AI Workplace Copilot (floating chat)
  const handleQueryCopilot = async (queryText: string): Promise<string> => {
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error("Connection failed");
      const result = await res.json();
      return result.reply;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Tabs layout renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <DashboardOverview
            tasks={data.tasks}
            meetings={data.meetings}
            documents={data.documents}
            members={data.members}
            aiInsights={data.aiInsights || ""}
            onRefreshInsights={handleRefreshInsights}
          />
        );
      case "Tasks":
        return (
          <TaskBoard
            tasks={data.tasks}
            members={data.members}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onTriggerAIPrioritize={handleTriggerAIPrioritize}
          />
        );
      case "Meetings":
        return (
          <MeetingScheduler
            meetings={data.meetings}
            members={data.members}
            onAddMeeting={handleAddMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        );
      case "Docs":
        return (
          <DocumentCollab
            documents={data.documents}
            onAddDocument={handleAddDocument}
            onAddComment={handleAddComment}
            onDeleteDocument={handleDeleteDocument}
          />
        );
      case "Analytics":
        return <TeamAnalytics members={data.members} tasks={data.tasks} />;
      default:
        return null;
    }
  };

  return (
    <div id="applet-main-canvas" className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Decorative Blur Ambient circles */}
      <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      {/* Main Container Wrapper */}
      <div id="layout-canvas-wrapper" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        
        {/* Upper Brand Header bar */}
        <header id="enterprise-brand-header" className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 via-violet-600 to-indigo-600 text-white shadow shadow-violet-500/20">
              <Sparkle className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent uppercase font-sans">
                Smart Workplace Collaboration
              </h1>
              <p className="text-4xs sm:text-3xs text-slate-400 font-mono tracking-widest uppercase">MNC Enterprise Core Hub</p>
            </div>
          </div>

          {/* Configuration utility buttons */}
          <div className="flex items-center gap-3">
            {/* Sync telemetry refresh button */}
            <button
              id="registry-sync-refresh-btn"
              onClick={fetchDashboardData}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-300 transition-all active:scale-95 cursor-pointer"
              title="Synchronize data registries"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Light / Dark selector toggle */}
            <button
              id="theme-selector-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-300 transition-all active:scale-95 cursor-pointer"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* Global Error message Banner box */}
        {errorMsg && (
          <motion.div
            id="global-error-card"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-rose-500/20 bg-rose-950/20 px-4 py-3 text-xs font-semibold text-rose-400 flex items-center justify-between"
          >
            <span>{errorMsg}</span>
            <button id="close-error-btn" onClick={() => setErrorMsg("")} className="text-rose-400 font-bold ml-2 hover:text-white uppercase text-2xs tracking-wider">Dismiss</button>
          </motion.div>
        )}

        {/* Navigation Horizontal Tab Bar */}
        <nav id="workspace-view-tabs" className="flex items-center gap-1 overflow-x-auto border-b border-white/5 pb-3 mb-6 scrollbar-none">
          {[
            { id: "Overview", label: "Executive Hub", icon: Activity },
            { id: "Tasks", label: "Sprint Backlogs", icon: CheckSquare },
            { id: "Meetings", label: "Calendar Slots", icon: Calendar },
            { id: "Docs", label: "Knowledge Base", icon: FileText },
            { id: "Analytics", label: "Workloads", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                id={`navigation-tab-btn-${tab.id}`}
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/10 border-transparent"
                    : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:border-white/5 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Primary Views container */}
        <main id="workspace-primary-view" className="min-h-[420px]">
          {loading ? (
            <div id="loader-fallback-panel" className="flex flex-col items-center justify-center p-24 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-violet-400 mb-3" />
              <p className="text-sm font-bold text-slate-300">Synchronizing team registries...</p>
              <p className="text-xs text-slate-500 mt-1">Downloading documents metrics and active workflows</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                id={`view-animator-${activeTab}`}
                key={activeTab}
                initial={{ opacity: 0, x: direction * 40, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: direction * -40, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Footer info line */}
        <footer id="applet-visual-footer" className="mt-16 pt-6 border-t border-white/5 text-center text-4xs font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
          MNC Smart Workplace Collaboration Portal &bull; System Active &bull; Secure API Tunnel Encryption
        </footer>

        {/* Floating AI Copilot retractor Panel */}
        <WorkplaceCopilot onQueryCopilot={handleQueryCopilot} />
      </div>
    </div>
  );
}
