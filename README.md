

# Smart Workplace Collaboration Dashboard

An advanced, AI-powered workplace collaboration and team productivity dashboard featuring task management, meeting scheduling, team workload analytics, collaborative documents, and Gemini-prioritized task recommendations.

Built as an AI Studio application utilizing server-side Gemini API integration.

---
project Link:https://smart-workplace-collaboration-dashboard.onrender.com

## 🚀 Features

* **AI-Powered Prioritization:** Smart task recommendations leveraging the Gemini API to optimize team productivity.


* **Task Management:** Clean interfaces to track, schedule, and organize tasks across teams.


* **Meeting & Resource Scheduling:** Simple coordination for team meetings and workplace collaborative sessions.


* **Workload Analytics:** Dynamic analytics insights to monitor and map out team workloads effectively.


* **Collaborative Documents:** Seamless real-time documentation hub for better workplace integration.



---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide React.


* **Backend:** Node.js, Express, `tsx` (TypeScript Execution), `esbuild`.


* **AI Engine:** `@google/genai` (Gemini API).



---

## 📦 Installation & Setup

### Prerequisites

* **Node.js** installed on your system.


* A **Gemini API Key** from Google AI Studio.



### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Smart-Workplace-Collaboration-Dashboard.git
cd Smart-Workplace-Collaboration-Dashboard

```

### 2. Install Dependencies

Install the required node modules for both the frontend and backend environment:

```bash
npm install

```

### 3. Environment Configuration

Create a `.env.local` (or `.env`) file in the root directory and configure the environment keys:

```env
# Required for Gemini AI API calls
GEMINI_API_KEY="your_gemini_api_key_here"

# App hosting URL (Automatically injected by Cloud Run in production)
APP_URL="http://localhost:5173"

```

### 4. Run Locally

Start the development server (`server.ts` handles the execution using `tsx`):

```bash
npm run dev

```

---

## 🤖 Available Scripts

You can run the following commands using `npm`:

* **`npm run dev`**: Starts the application in local development mode.


* **`npm run build`**: Builds the static frontend via Vite and bundles the Express server file into `dist/server.cjs` using esbuild.


* **`npm run start`**: Launches the built production server using Node.


* **`npm run lint`**: Performs Type checking via TypeScript without emitting output files.


* **`npm run clean`**: Removes the compiled production folder `dist`.


