import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Send, MessageSquare, Tag, Plus, User, Clock, ChevronRight, Check, X, Trash2 } from "lucide-react";
import { Document, DocCategory } from "../types";

interface DocumentCollabProps {
  documents: Document[];
  onAddDocument: (docData: { title: string; category: DocCategory; content: string; authorName: string }) => Promise<void>;
  onAddComment: (docId: string, authorName: string, text: string) => Promise<void>;
  onDeleteDocument?: (id: string) => Promise<void>;
}

export default function DocumentCollab({
  documents,
  onAddDocument,
  onAddComment,
  onDeleteDocument,
}: DocumentCollabProps) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Janani Selvam"); // default mock user selector

  // New Doc Fields
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<DocCategory>("Technical");
  const [newContent, setNewContent] = useState("");
  const [docAuthor, setDocAuthor] = useState("Adhithya Vardhan");
  const [formError, setFormError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError("Title and content are required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      await onAddDocument({
        title: newTitle,
        category: newCategory,
        content: newContent,
        authorName: docAuthor,
      });

      // Show success micro-badge
      setShowSuccess(true);

      setTimeout(() => {
        // Reset fields
        setNewTitle("");
        setNewContent("");
        setShowSuccess(false);
        setIsFormOpen(false);
        
        // Auto-select newly created doc if documents is updated
        if (documents.length > 0) {
          setSelectedDocId(documents[0].id);
        }
      }, 1500);
    } catch (err) {
      setFormError("Failed to register document draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeDoc) return;

    await onAddComment(activeDoc.id, commentAuthor, commentText);
    setCommentText("");
  };

  const getCategoryColor = (cat: DocCategory) => {
    switch (cat) {
      case "Technical":
        return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      case "Design":
        return "text-pink-400 bg-pink-500/10 border-pink-500/20";
      case "Sprint Planning":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Marketing":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div id="document-collab-container" className="glass-panel rounded-2xl border border-white/5 bg-slate-900/10 shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/5 min-h-[580px]">
        
        {/* Left Sidebar Pane */}
        <div id="docs-sidebar-column" className="p-5 lg:p-6 bg-slate-950/20 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-400" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">Enterprise Docs</h3>
            </div>

            <button
              id="draft-doc-btn"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-100 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Draft Doc
            </button>
          </div>

          {/* Sidebar document links list with scroll limit */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {documents.length === 0 ? (
              <p className="text-2xs text-slate-500 italic p-4 text-center">No documents registered.</p>
            ) : (
              documents.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    id={`doc-sidebar-item-${doc.id}`}
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full min-h-[105px] rounded-xl p-4 cursor-pointer text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-r from-violet-950/30 to-slate-900/50 border-violet-500/30 shadow-md"
                        : "bg-slate-900/20 border-white/5 hover:border-white/10 hover:bg-slate-900/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-block border rounded px-1.5 py-0.5 text-4xs font-bold tracking-wider uppercase font-mono ${getCategoryColor(doc.category)}`}>
                          {doc.category}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-4xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" /> {doc.updatedAt}
                          </span>
                          {onDeleteDocument && (
                            <button
                              id={`delete-doc-btn-${doc.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteDocument(doc.id);
                              }}
                              className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer shrink-0"
                              title="Delete Document"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="mt-2 text-xs font-bold text-slate-200 truncate">{doc.title}</h4>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-4xs font-mono text-slate-400 border-t border-white/5 pt-1.5">
                      <span className="truncate">By {doc.lastEditedBy}</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <MessageSquare className="h-3 w-3 text-slate-500" /> {doc.comments.length}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Pane (Detailed Document Reader and Comments) */}
        <div id="docs-content-column" className="lg:col-span-2 p-5 lg:p-6 flex flex-col justify-between space-y-6">
          
          {/* Selected Document content & Comment Panel */}
          {activeDoc ? (
            <motion.div
              id={`doc-display-panel-${activeDoc.id}`}
              key={activeDoc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Document display card */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-2.5">
                  <div>
                    <span className={`inline-block border rounded px-2 py-0.5 text-3xs font-bold tracking-wider uppercase font-mono ${getCategoryColor(activeDoc.category)}`}>
                      {activeDoc.category}
                    </span>
                    <h2 className="text-md sm:text-lg font-extrabold text-white mt-1.5 tracking-tight">{activeDoc.title}</h2>
                  </div>

                  <div className="text-left sm:text-right text-3xs text-slate-400 font-mono space-y-0.5 shrink-0">
                    <div>Editor: <span className="text-slate-200 font-semibold">{activeDoc.lastEditedBy}</span></div>
                    <div>Updated: <span className="text-slate-200 font-semibold">{activeDoc.updatedAt}</span></div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-violet-600 bg-slate-950/20 p-4.5 rounded-xl border border-white/5">
                  {activeDoc.content}
                </div>
              </div>

              {/* Team Comment stream block */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <h3 className="text-3xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-400" /> Discussion Stream ({activeDoc.comments.length})
                </h3>

                {/* Comment stream logs */}
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {activeDoc.comments.length === 0 ? (
                    <p id="no-comments-alert" className="text-2xs text-slate-500 italic py-2">No feedback published yet. Be the first to start the coordination thread!</p>
                  ) : (
                    activeDoc.comments.map((comment) => (
                      <div id={`comment-bubble-${comment.id}`} key={comment.id} className="rounded-lg bg-slate-950/40 border border-white/5 p-3 space-y-1">
                        <div className="flex items-center justify-between text-3xs font-mono text-slate-400">
                          <span className="font-bold text-slate-200">{comment.authorName}</span>
                          <span>{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-normal">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment Form */}
                <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-3xs text-slate-400 font-mono uppercase tracking-wider shrink-0">
                      <User className="h-3.5 w-3.5 text-violet-400" /> Posting as:
                    </div>

                    <select
                      id="comment-poster-selector"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 px-2.5 py-1 text-2xs text-slate-200 outline-none transition-all cursor-pointer"
                    >
                      <option value="Janani Selvam">Janani Selvam (Frontend)</option>
                      <option value="Vikram Ram">Vikram Ram (Backend)</option>
                      <option value="Adhithya Vardhan">Adhithya Vardhan (Lead)</option>
                      <option value="Priya Nair">Priya Nair (PM)</option>
                    </select>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      id="comment-input"
                      type="text"
                      placeholder="Add professional suggestion or compliance checks..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500 pl-3 pr-11 py-2 text-xs text-slate-200 outline-none transition-all font-sans"
                    />
                    <button
                      id="comment-submit-btn"
                      type="submit"
                      className="absolute right-1.5 p-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-all cursor-pointer"
                      title="Submit Comment"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <FileText className="h-8 w-8 text-slate-600 mb-2.5 animate-pulse" />
              <p className="text-xs font-mono">No document selected. Click on a record from the registry panel.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Document Drafting Drawer Panel */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop with elegant blur */}
            <motion.div
              id="doc-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
            />

            {/* Drawer Panel */}
            <motion.div
              id="doc-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 p-6 shadow-2xl z-[101] overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">Draft Workplace Document</h3>
                  </div>
                  <button
                    id="close-doc-drawer-btn"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {formError && <p className="text-xs text-rose-400 font-medium">{formError}</p>}

                <form onSubmit={handleDocSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Document Title</label>
                    <input
                      id="new-doc-title-input"
                      type="text"
                      placeholder="e.g. Q3 Release Checklist"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Category</label>
                    <select
                      id="new-doc-category-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as DocCategory)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sprint Planning">Sprint Planning</option>
                      <option value="Release Notes">Release Notes</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Author Name</label>
                    <select
                      id="new-doc-author-select"
                      value={docAuthor}
                      onChange={(e) => setDocAuthor(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer"
                    >
                      <option value="Adhithya Vardhan">Adhithya Vardhan (Lead)</option>
                      <option value="Janani Selvam">Janani Selvam (Frontend)</option>
                      <option value="Vikram Ram">Vikram Ram (Backend)</option>
                      <option value="Priya Nair">Priya Nair (PM)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono">Document Body</label>
                    <textarea
                      id="new-doc-content-textarea"
                      rows={10}
                      placeholder="Provide rich text or standard structured paragraphs. Keep it professional..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 focus:border-violet-500 px-3 py-1.5 text-xs text-slate-200 outline-none transition-all resize-none font-mono"
                    />
                  </div>

                  {showSuccess && (
                    <motion.div
                      id="doc-draft-success-alert"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2"
                    >
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-400 font-extrabold" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Draft Published!</div>
                        <div className="text-3xs text-emerald-400/80 mt-0.5">Workspace document registries updated.</div>
                      </div>
                    </motion.div>
                  )}

                  <button
                    id="doc-submit-btn"
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    className="w-full mt-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 disabled:text-white/50 py-2.5 text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving Draft...
                      </>
                    ) : showSuccess ? (
                      <>
                        <Check className="h-4 w-4 animate-bounce" />
                        Draft Published!
                      </>
                    ) : (
                      "Publish Draft"
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
