import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize store file path
const DATA_STORE_PATH = path.join(process.cwd(), "data-store.json");

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Standard mock initial data for enterprise workplace
const getInitialData = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Date calculations
  const getOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const members = [
    { id: "mem_1", name: "Adhithya Vardhan", role: "Lead Architect", email: "adhithya@mnccorp.com", avatarColor: "from-emerald-400 to-teal-600", completedTasksCount: 12, activeTasksCount: 2 },
    { id: "mem_2", name: "Janani Selvam", role: "Senior Frontend Developer", email: "janani@mnccorp.com", avatarColor: "from-cyan-400 to-blue-600", completedTasksCount: 18, activeTasksCount: 3 },
    { id: "mem_3", name: "Vikram Ram", role: "Backend Engineering Lead", email: "vikram@mnccorp.com", avatarColor: "from-indigo-400 to-purple-600", completedTasksCount: 14, activeTasksCount: 4 },
    { id: "mem_4", name: "Priya Nair", role: "Principal Product Manager", email: "priya@mnccorp.com", avatarColor: "from-pink-400 to-rose-600", completedTasksCount: 9, activeTasksCount: 1 },
    { id: "mem_5", name: "Sanjay Kumar", role: "Senior QA Analyst", email: "sanjay@mnccorp.com", avatarColor: "from-amber-400 to-orange-600", completedTasksCount: 21, activeTasksCount: 1 },
  ];

  const tasks = [
    {
      id: "task_1",
      title: "Revamp client billing dashboard UI",
      description: "Migrate the billing metrics view to Tailwind v4 and optimize dynamic layout for mobile responsive viewports.",
      assigneeId: "mem_2",
      priority: "High" as const,
      status: "In Progress" as const,
      dueDate: getOffsetDate(2),
      aiAssessment: "Prioritized as High. Direct impact on client invoice onboarding this week. Layout structure needs to align with design specs.",
      createdAt: getOffsetDate(-3),
    },
    {
      id: "task_2",
      title: "Optimize PostgreSQL query bottlenecks",
      description: "Analyze slow queries on the analytical tables and implement table indices or materialised views.",
      assigneeId: "mem_3",
      priority: "Critical" as const,
      status: "Pending" as const,
      dueDate: getOffsetDate(1),
      aiAssessment: "Critical urgency. Database latency is currently touching 2.4s on tenant aggregations. Recommend direct indexation on compound foreign keys.",
      createdAt: getOffsetDate(-2),
    },
    {
      id: "task_3",
      title: "Draft system architecture for V2 core",
      description: "Document core microservices interfaces, data pipelines, and security layers using visual sequence charts.",
      assigneeId: "mem_1",
      priority: "High" as const,
      status: "Pending" as const,
      dueDate: getOffsetDate(5),
      aiAssessment: "Recommended priority: High. Foundations for the Q3 migration rely on this artifact.",
      createdAt: getOffsetDate(-4),
    },
    {
      id: "task_4",
      title: "Deploy end-to-end Cypress regression suite",
      description: "Implement automated testing for the standard user checkout and auth authentication loops.",
      assigneeId: "mem_5",
      priority: "Medium" as const,
      status: "Completed" as const,
      dueDate: getOffsetDate(-1),
      aiAssessment: "Completed successfully. Coverage has reached 84%.",
      createdAt: getOffsetDate(-5),
    },
    {
      id: "task_5",
      title: "Review corporate billing SLA compliance",
      description: "Draft alignment proposal for service-level guarantees on custom billing routes.",
      assigneeId: "mem_4",
      priority: "Low" as const,
      status: "Completed" as const,
      dueDate: getOffsetDate(-2),
      aiAssessment: "Low priority compliance documentation completed.",
      createdAt: getOffsetDate(-6),
    }
  ];

  const meetings = [
    {
      id: "meet_1",
      title: "Sprint Review & Demo Sync",
      date: todayStr,
      time: "11:00",
      duration: 60,
      type: "Sprint Review" as const,
      organizerId: "mem_4",
      attendees: ["mem_1", "mem_2", "mem_3", "mem_4", "mem_5"],
      joinLink: "https://meet.google.com/abc-defg-hij",
      agenda: "Review completed billing metrics, demonstrate E2E testing logs, and align on bottleneck optimization tasks."
    },
    {
      id: "meet_2",
      title: "Architecture & Design Review",
      date: getOffsetDate(1),
      time: "14:30",
      duration: 45,
      type: "Brainstorming" as const,
      organizerId: "mem_1",
      attendees: ["mem_1", "mem_3"],
      joinLink: "https://meet.google.com/xyz-pqrs-uvw",
      agenda: "Review database bottleneck query plan options and outline structural microservices blueprints."
    },
    {
      id: "meet_3",
      title: "Enterprise Client Alignment Session",
      date: getOffsetDate(3),
      time: "16:00",
      duration: 30,
      type: "Client" as const,
      organizerId: "mem_4",
      attendees: ["mem_2", "mem_4"],
      joinLink: "https://meet.google.com/mnc-sync-2026",
      agenda: "Align on customized enterprise branding layouts and finalize timeline for billing dashboard deployment."
    }
  ];

  const documents = [
    {
      id: "doc_1",
      title: "API Design Standards & Guidelines",
      category: "Technical" as const,
      content: `### MNC Workspace API Design Guidelines

All services must communicate exclusively via standardized JSON REST interfaces. 

#### 1. Path Conventions
- Plural nouns for resource collections: \`/api/v1/tasks\`
- Sub-resources for structured relations: \`/api/v1/documents/:id/comments\`

#### 2. Authentication
Each outgoing request must carry the Bearer JWT token inside the authorization header:
\`Authorization: Bearer <token>\`

#### 3. Error Schemas
\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested task was not found.",
    "details": {}
  }
}
\`\`\``,
      lastEditedBy: "Adhithya Vardhan",
      updatedAt: getOffsetDate(-1),
      comments: [
        { id: "c_1", authorName: "Vikram Ram", text: "Looks excellent. I added the Error schema to match our backend express filters.", timestamp: "2026-06-27 10:45 AM" },
        { id: "c_2", authorName: "Janani Selvam", text: "Can we include standard pagination params? e.g. ?page=1&limit=20", timestamp: "2026-06-27 02:15 PM" }
      ]
    },
    {
      id: "doc_2",
      title: "MNC Corporate Design Tokens",
      category: "Design" as const,
      content: `### MNC Enterprise Core Design Theme

Consistent typography and structural pairings for all internal workplace portals.

#### Palette Tokens
- **Canvas Base**: Slate-950 (\`#020617\`) - Pure enterprise premium slate.
- **Accents**: 
  - Emerald-500 (\`#10b981\`) - Success & Completed events
  - Cyan-400 (\`#22d3ee\`) - Smart AI and Automation cues
  - Violet-500 (\`#8b5cf6\`) - Event Schedules and Interactive controls
  - Rose-500 (\`#f43f5e\`) - Critical Priority Alert indicators

#### Visual Hierarchy
We enforce a **Desktop-First Precision** layout wrapped in subtle gradient glass borders:
- Border: \`border-white/10\` or \`border-white/5\`
- Backdrop filter: \`backdrop-blur-md bg-slate-900/40\``,
      lastEditedBy: "Janani Selvam",
      updatedAt: getOffsetDate(-2),
      comments: [
        { id: "c_3", authorName: "Priya Nair", text: "This perfectly represents our enterprise visual standard. Ensure Tailwind V4 matches these values.", timestamp: "2026-06-26 11:30 AM" }
      ]
    }
  ];

  const aiInsights = "Welcome to the MNC Smart Workplace Hub! All services are active. Our telemetry shows databases are operating at full capacity. Current suggestions: (1) Ensure Vikram Ram gets assistance as they have 4 active tasks. (2) Database slow-query review tomorrow is critical; prepare diagnostic profiles.";

  return { tasks, meetings, documents, members, aiInsights };
};

// Load or Seed Data
const readData = () => {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const content = fs.readFileSync(DATA_STORE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading data store file, falling back to seed:", error);
  }
  const defaultData = getInitialData();
  writeData(defaultData);
  return defaultData;
};

const writeData = (data: any) => {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing data store file:", error);
  }
};

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
const getAIClient = (): GoogleGenAI | null => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
};

// ==========================================
// API REST ENDPOINTS
// ==========================================

// 1. Get full dashboard state
app.get("/api/dashboard", (req, res) => {
  const data = readData();
  res.json(data);
});

// 2. Tasks CRUD
app.post("/api/tasks", (req, res) => {
  const data = readData();
  const { title, description, assigneeId, priority, dueDate } = req.body;
  
  if (!title || !assigneeId || !priority || !dueDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newTask = {
    id: "task_" + generateId(),
    title,
    description: description || "",
    assigneeId,
    priority,
    status: "Pending" as const,
    dueDate,
    createdAt: new Date().toISOString().split('T')[0],
    aiAssessment: "Awaiting manual trigger or scheduled AI triage."
  };

  data.tasks.push(newTask);
  
  // Adjust assignee active count
  const assignee = data.members.find((m: any) => m.id === assigneeId);
  if (assignee) {
    assignee.activeTasksCount += 1;
  }

  writeData(data);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const data = readData();
  const taskId = req.params.id;
  const taskIdx = data.tasks.findIndex((t: any) => t.id === taskId);

  if (taskIdx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const oldTask = data.tasks[taskIdx];
  const updatedFields = req.body;

  // Handle task assignee changes active tasks count
  if (updatedFields.assigneeId && updatedFields.assigneeId !== oldTask.assigneeId) {
    const oldAssignee = data.members.find((m: any) => m.id === oldTask.assigneeId);
    if (oldAssignee) oldAssignee.activeTasksCount = Math.max(0, oldAssignee.activeTasksCount - 1);

    const newAssignee = data.members.find((m: any) => m.id === updatedFields.assigneeId);
    if (newAssignee) newAssignee.activeTasksCount += 1;
  }

  // Handle completion counters
  if (updatedFields.status && updatedFields.status !== oldTask.status) {
    const assignee = data.members.find((m: any) => m.id === (updatedFields.assigneeId || oldTask.assigneeId));
    if (assignee) {
      if (updatedFields.status === "Completed") {
        assignee.completedTasksCount += 1;
        assignee.activeTasksCount = Math.max(0, assignee.activeTasksCount - 1);
      } else if (oldTask.status === "Completed") {
        assignee.completedTasksCount = Math.max(0, assignee.completedTasksCount - 1);
        assignee.activeTasksCount += 1;
      }
    }
  }

  const updatedTask = {
    ...oldTask,
    ...updatedFields
  };

  data.tasks[taskIdx] = updatedTask;
  writeData(data);
  res.json(updatedTask);
});

app.delete("/api/tasks/:id", (req, res) => {
  const data = readData();
  const taskId = req.params.id;
  const taskIdx = data.tasks.findIndex((t: any) => t.id === taskId);

  if (taskIdx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const task = data.tasks[taskIdx];
  
  // Deduct active task counts
  if (task.status !== "Completed") {
    const assignee = data.members.find((m: any) => m.id === task.assigneeId);
    if (assignee) {
      assignee.activeTasksCount = Math.max(0, assignee.activeTasksCount - 1);
    }
  }

  data.tasks.splice(taskIdx, 1);
  writeData(data);
  res.json({ success: true, message: "Task deleted successfully" });
});

// 3. Meetings Create
app.post("/api/meetings", (req, res) => {
  const data = readData();
  const { title, date, time, duration, type, organizerId, attendees, agenda } = req.body;

  if (!title || !date || !time || !duration || !type || !organizerId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newMeeting = {
    id: "meet_" + generateId(),
    title,
    date,
    time,
    duration: Number(duration),
    type,
    organizerId,
    attendees: attendees || [],
    joinLink: `https://meet.google.com/${generateId().split('').reverse().join('').substring(0,3)}-${generateId().substring(0,4)}-${generateId().substring(0,3)}`,
    agenda: agenda || ""
  };

  data.meetings.push(newMeeting);
  writeData(data);
  res.status(201).json(newMeeting);
});

// Delete meeting
app.delete("/api/meetings/:id", (req, res) => {
  const data = readData();
  const meetId = req.params.id;
  const meetIdx = data.meetings.findIndex((m: any) => m.id === meetId);

  if (meetIdx === -1) {
    return res.status(404).json({ error: "Meeting slot not found" });
  }

  data.meetings.splice(meetIdx, 1);
  writeData(data);
  res.json({ success: true, message: "Meeting deleted successfully" });
});

// 4. Documents CRUD & Commenting
app.post("/api/documents", (req, res) => {
  const data = readData();
  const { title, category, content, authorName } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newDoc = {
    id: "doc_" + generateId(),
    title,
    category,
    content,
    lastEditedBy: authorName || "Anonymous",
    updatedAt: new Date().toISOString().split('T')[0],
    comments: []
  };

  data.documents.unshift(newDoc);
  writeData(data);
  res.status(201).json(newDoc);
});

// Delete document
app.delete("/api/documents/:id", (req, res) => {
  const data = readData();
  const docId = req.params.id;
  const docIdx = data.documents.findIndex((d: any) => d.id === docId);

  if (docIdx === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  data.documents.splice(docIdx, 1);
  writeData(data);
  res.json({ success: true, message: "Document deleted successfully" });
});

app.post("/api/documents/:id/comments", (req, res) => {
  const data = readData();
  const docId = req.params.id;
  const { authorName, text } = req.body;

  if (!authorName || !text) {
    return res.status(400).json({ error: "Missing authorName or text fields" });
  }

  const doc = data.documents.find((d: any) => d.id === docId);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }

  const newComment = {
    id: "c_" + generateId(),
    authorName,
    text,
    timestamp: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  doc.comments.push(newComment);
  doc.updatedAt = new Date().toISOString().split('T')[0];
  writeData(data);
  res.status(201).json(newComment);
});

// ==========================================
// GEMINI INTELLIGENT CORES
// ==========================================

// endpoint 5: AI prioritized assessments
app.post("/api/ai/prioritize", async (req, res) => {
  const data = readData();
  const ai = getAIClient();

  if (!ai) {
    console.warn("Gemini API Key missing or empty in Environment Secrets");
    // Fallback safe simulation
    data.tasks = data.tasks.map((t: any) => {
      let suffix = " (Fallback Triage: Highly critical based on short timeline)";
      if (t.priority === "Low") suffix = " (Low urgency queue; review during retrospective)";
      return {
        ...t,
        aiAssessment: `[Simulation Triage] Ensure resources are allocated for "${t.title}". Due date: ${t.dueDate}. ${suffix}`
      };
    });
    writeData(data);
    return res.json({
      success: true,
      tasks: data.tasks,
      warning: "Gemini API Key is not set in Settings > Secrets. Using simulated prioritization assessment."
    });
  }

  try {
    const prompt = `You are an expert Agile Scrum master and Technical director evaluating enterprise software development workloads. 
    Analyze the following list of tasks and assign a smart priority assessment, describing why the task is prioritized, actionable suggestions for implementation, and potential blockers based on the assignee and the deadline.
    
    Here is the team profiles:
    ${JSON.stringify(data.members, null, 2)}

    Here is the current list of tasks to prioritize:
    ${JSON.stringify(data.tasks, null, 2)}

    Return a valid JSON array of objects representing the task assessments, structured as:
    [
      { "id": "task_id_here", "aiAssessment": "Brief explanation of dynamic urgency, workload, blockers, and recommendations." }
    ]
    Do not output markdown block wrappers (like \`\`\`json), just raw array.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text ? response.text.trim() : "[]";
    const assessments = JSON.parse(resultText);

    // Update tasks with new assessments
    if (Array.isArray(assessments)) {
      assessments.forEach((assessment: any) => {
        const task = data.tasks.find((t: any) => t.id === assessment.id);
        if (task) {
          task.aiAssessment = assessment.aiAssessment;
        }
      });
      writeData(data);
    }

    res.json({ success: true, tasks: data.tasks });
  } catch (error: any) {
    console.error("Gemini prioritizing failed:", error);
    res.status(500).json({ error: "Gemini execution failed", details: error.message });
  }
});

// endpoint 6: AI Team-wide Analytics & Suggestions
app.post("/api/ai/insights", async (req, res) => {
  const data = readData();
  const ai = getAIClient();

  if (!ai) {
    const mockSuggestions = "Active workload is balanced. Suggest delegating 'Database Slow Queries' assistance to Adhithya Vardhan as Vikram is nearing his sprint limit. Consider rescheduling low priority docs reviews. (Setup GEMINI_API_KEY for custom deep insights)";
    data.aiInsights = mockSuggestions;
    writeData(data);
    return res.json({ insights: mockSuggestions, warning: "Using fallback mock suggestions because Gemini API Key is missing." });
  }

  try {
    const prompt = `Analyze the current state of our Agile workspace, identify team workload bottle-necks, critical items, and give 3 short, highly actionable management recommendations.
    
    Workplace current tasks:
    ${JSON.stringify(data.tasks, null, 2)}

    Workplace current team members & metrics:
    ${JSON.stringify(data.members, null, 2)}

    Workplace scheduled meetings:
    ${JSON.stringify(data.meetings, null, 2)}

    Return your feedback as a short, beautiful cohesive summary (maximum 3 sentences or 80 words) in English. Focus on dynamic facts like over-burdened team members, timeline risks, and meeting efficiency. Do not mention technical jargon or system outputs, speak as an expert Chief Operating Officer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const insights = response.text ? response.text.trim() : "Unable to compile recommendations.";
    data.aiInsights = insights;
    writeData(data);
    res.json({ insights });
  } catch (error: any) {
    console.error("Gemini insights compilation failed:", error);
    res.status(500).json({ error: "Gemini execution failed", details: error.message });
  }
});

// endpoint 7: Enterprise Workplace Copilot Chat
app.post("/api/ai/copilot", async (req, res) => {
  const data = readData();
  const { query, chatHistory } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const ai = getAIClient();
  if (!ai) {
    // Elegant fallback answering based on the exact local dataset
    const lowercaseQuery = query.toLowerCase();
    let responseText = "The AI Copilot is currently operating in local mode. Please configure the `GEMINI_API_KEY` in the Secrets Panel for smart, deep context answering.";
    
    if (lowercaseQuery.includes("task") || lowercaseQuery.includes("work")) {
      const active = data.tasks.filter((t: any) => t.status !== "Completed").length;
      responseText = `Currently, there are ${active} active tasks in the sprint. Vikram Ram has the highest workload with ${data.members.find((m: any) => m.id === "mem_3")?.activeTasksCount} active tasks including critical database indexing.`;
    } else if (lowercaseQuery.includes("meet") || lowercaseQuery.includes("calendar")) {
      responseText = `There are ${data.meetings.length} scheduled meetings. The closest one is "${data.meetings[0]?.title}" at ${data.meetings[0]?.time} today.`;
    } else if (lowercaseQuery.includes("member") || lowercaseQuery.includes("who")) {
      const names = data.members.map((m: any) => m.name).join(", ");
      responseText = `The team consists of: ${names}. Priya Nair handles Product Management, Vikram Ram handles backend queries, and Janani handles the React frontend.`;
    }
    
    return res.json({ reply: responseText });
  }

  try {
    // Provide full dataset inside System context so it acts as a real Grounded Workplace Expert
    const systemPrompt = `You are "MNC Copilot", a smart chief-of-staff AI assistant embedded in the team's workplace dashboard.
    You have absolute access to the current sprint state:
    
    --- TEAM MEMBERS ---
    ${JSON.stringify(data.members, null, 2)}
    
    --- ACTIVE TASKS ---
    ${JSON.stringify(data.tasks, null, 2)}
    
    --- MEETINGS ---
    ${JSON.stringify(data.meetings, null, 2)}
    
    --- SHARED DOCUMENTS ---
    ${JSON.stringify(data.documents.map((d: any) => ({ title: d.title, category: d.category, contentPreview: d.content.substring(0, 200) })), null, 2)}

    When answering:
    - Always answer user questions with real facts from this dashboard data.
    - Be highly precise, concise, and structured. Use bullet points for recommendations.
    - Be professional, warm, encouraging, and helpful.
    - Keep answers under 150 words. Focus directly on answering the exact question.`;

    const chatMessages = [
      { role: "user", parts: [{ text: `Hi! Access the workplace database and answer this: ${query}` }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatMessages,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ reply: response.text ? response.text.trim() : "I'm having trouble analyzing the core workspace databases right now." });
  } catch (error: any) {
    console.error("Gemini copilot query failed:", error);
    res.status(500).json({ error: "Gemini Copilot execution failed", details: error.message });
  }
});


// ==========================================
// VITE DEV INTEGRATION & STATIC PATHS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in Express development sandbox mode");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Workplace Collaboration server active at http://localhost:${PORT}`);
  });
}

startServer();
