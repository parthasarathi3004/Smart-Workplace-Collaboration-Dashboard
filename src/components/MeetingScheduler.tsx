import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, Video, Plus, Check, UserPlus, FileText, ChevronRight, Sparkles, X, Trash2 } from "lucide-react";
import { Meeting, TeamMember, MeetingType } from "../types";

interface MeetingSchedulerProps {
  meetings: Meeting[];
  members: TeamMember[];
  onAddMeeting: (meetingData: Omit<Meeting, "id" | "joinLink">) => Promise<void>;
  onDeleteMeeting?: (id: string) => Promise<void>;
}

export default function MeetingScheduler({
  meetings,
  members,
  onAddMeeting,
  onDeleteMeeting,
}: MeetingSchedulerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState<number>(30);
  const [type, setType] = useState<MeetingType>("Internal");
  const [organizerId, setOrganizerId] = useState(members[0]?.id || "");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [agenda, setAgenda] = useState("");
  const [formError, setFormError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAttendeeToggle = (id: string) => {
    if (selectedAttendees.includes(id)) {
      setSelectedAttendees(selectedAttendees.filter((att) => att !== id));
    } else {
      setSelectedAttendees([...selectedAttendees, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Meeting title is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      await onAddMeeting({
        title,
        date,
        time,
        duration,
        type,
        organizerId,
        attendees: selectedAttendees,
        agenda,
      });

      // Show success celebration toast first
      setShowSuccess(true);
      
      // Reset Form after a short delay
      setTimeout(() => {
        setTitle("");
        setAgenda("");
        setSelectedAttendees([]);
        setShowSuccess(false);
        setIsFormOpen(false);
      }, 1500);
    } catch (err) {
      setFormError("Failed to block calendar slot. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadgeColor = (type: MeetingType) => {
    switch (type) {
      case "Client":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "Sprint Review":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "Brainstorming":
        return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "1-on-1":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-violet-500/10 border-violet-500/20 text-violet-400";
    }
  };

  return (
    <div id="meeting-scheduler-container" className="w-full">
      
      {/* Meetings Schedule lists panel */}
      <div id="meetings-list-column" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Enterprise Calendar Blocks</h3>
          </div>

          <button
            id="schedule-meeting-btn"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-100 transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Block Time
          </button>
        </div>

        {/* Calendar Lists */}
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div id="empty-meetings-alert" className="p-8 glass-panel rounded-xl text-center">
              <p className="text-sm font-bold text-white">No active meeting calendars scheduled.</p>
              <p className="text-xs text-slate-400 mt-1">Book a time slot using the dashboard scheduler panel.</p>
            </div>
          ) : (
            meetings.map((meeting) => {
              const organizer = members.find((m) => m.id === meeting.organizerId);

              return (
                <motion.div
                  id={`meeting-card-${meeting.id}`}
                  key={meeting.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel glass-card-hover rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`inline-block border rounded-md px-2 py-0.5 text-3xs font-semibold tracking-wider uppercase font-mono ${getTypeBadgeColor(meeting.type)}`}>
                        {meeting.type}
                      </span>
                      <span className="flex items-center gap-1 text-3xs text-slate-400 font-mono">
                        <Clock className="h-3 w-3" /> {meeting.date} at {meeting.time} ({meeting.duration}m)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">{meeting.title}</h4>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {meeting.agenda || "No customized agenda provided. Focus on team roadmap milestones."}
                    </p>

                    {/* Participant Avatars List */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-3xs text-slate-400 mr-1.5 uppercase font-mono font-bold">Attendees:</span>
                      
                      {meeting.attendees.map((id) => {
                        const m = members.find((member) => member.id === id);
                        if (!m) return null;
                        return (
                          <div
                            id={`attendee-avatar-icon-${id}`}
                            key={id}
                            className={`h-6 w-6 rounded-full bg-gradient-to-tr ${m.avatarColor} text-white font-extrabold text-3xs flex items-center justify-center border border-slate-900 shadow`}
                            title={`${m.name} (${m.role})`}
                          >
                            {m.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col items-start md:items-end justify-between shrink-0 h-full border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5">
                    <div className="text-right hidden md:block">
                      <div className="text-3xs text-slate-400 font-mono uppercase tracking-wider">Host</div>
                      <div className="text-xs text-slate-200 font-semibold">{organizer ? organizer.name.split(" ")[0] : "System"}</div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 md:mt-2.5 w-full md:w-auto">
                      <a
                        id={`join-meeting-link-${meeting.id}`}
                        href={meeting.joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-4.5 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95 text-center"
                      >
                        <Video className="h-3.5 w-3.5" /> Join Meet
                      </a>
                      {onDeleteMeeting && (
                        <button
                          id={`delete-meeting-btn-${meeting.id}`}
                          onClick={() => onDeleteMeeting(meeting.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all active:scale-95 cursor-pointer"
                          title="Delete Meeting Slot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Slide-over Reservation Form Panel */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="booking-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
            />

            {/* Panel */}
            <motion.div
              id="booking-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 p-6 shadow-2xl z-[101] overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">Reserve Time Block</h3>
                  </div>
                  <button
                    id="close-booking-drawer-btn"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {formError && <p className="text-xs text-rose-400 font-medium">{formError}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Meeting Title</label>
                    <input
                      id="booking-title-input"
                      type="text"
                      placeholder="e.g. Q3 Sprint Retro"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Date</label>
                      <input
                        id="booking-date-input"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Start Time</label>
                      <input
                        id="booking-time-input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Duration</label>
                      <select
                        id="booking-duration-select"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                      >
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Sync Category</label>
                      <select
                        id="booking-type-select"
                        value={type}
                        onChange={(e) => setType(e.target.value as MeetingType)}
                        className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                      >
                        <option value="Internal">Internal Sync</option>
                        <option value="Client">Client Demo</option>
                        <option value="Sprint Review">Sprint Review</option>
                        <option value="Brainstorming">Brainstorming</option>
                        <option value="1-on-1">1-on-1 Sync</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Host Organizer</label>
                    <select
                      id="booking-host-select"
                      value={organizerId}
                      onChange={(e) => setOrganizerId(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Attendees Checkbox Area */}
                  <div className="space-y-1.5">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                      <UserPlus className="h-3 w-3" /> Select Invited Members
                    </label>
                    
                    <div className="max-h-[120px] overflow-y-auto space-y-1 bg-slate-950/50 rounded-lg p-2 border border-white/5">
                      {members.map((m) => {
                        const isChecked = selectedAttendees.includes(m.id);
                        return (
                          <div
                            id={`attendee-checkbox-row-${m.id}`}
                            key={m.id}
                            onClick={() => handleAttendeeToggle(m.id)}
                            className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/5 cursor-pointer text-2xs transition-all"
                          >
                            <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-all ${
                              isChecked ? "bg-violet-600 border-violet-500 text-white" : "border-white/15"
                            }`}>
                              {isChecked && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <span className="text-slate-300 font-sans truncate">{m.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Agenda Topics
                    </label>
                    <textarea
                      id="booking-agenda-textarea"
                      rows={2}
                      placeholder="Reviewing indices compliance guidelines..."
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all resize-none"
                    />
                  </div>

                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        id="meeting-scheduler-success-toast"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-md shadow-emerald-950/20"
                      >
                        <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-emerald-400 font-extrabold" />
                        </div>
                        <div>
                          <div className="font-bold text-white">Time Block Reserved Successfully!</div>
                          <div className="text-3xs text-emerald-400/80 mt-0.5">MNC workspace registries synchronized.</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    id="booking-submit-btn"
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    className="w-full mt-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 disabled:text-white/50 py-2.5 text-xs font-bold text-white transition-all shadow active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Locking Slot...
                      </>
                    ) : showSuccess ? (
                      <>
                        <Check className="h-4 w-4 animate-bounce" />
                        Reservation Confirmed!
                      </>
                    ) : (
                      "Confirm Reservation"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
