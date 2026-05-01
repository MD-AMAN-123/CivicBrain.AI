<div align="center">
  
  <h1>🏛️ CivicBrain.AI</h1>
  <p><strong>Next-Generation Civic Learning & AI Assistant Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2.5-blue?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express.js-5.x-lightgrey?logo=express" alt="Express.js" />
    <img src="https://img.shields.io/badge/Google%20Cloud-Run-4285F4?logo=google-cloud&logoColor=white" alt="Google Cloud" />
    <img src="https://img.shields.io/badge/AI-Gemini%202.5-orange?logo=google&logoColor=white" alt="Gemini API" />
  </p>

</div>

---

## 🌟 Overview

**CivicBrain.AI** is a state-of-the-art interactive platform designed to modernize civic learning. It combines a stunning 3D interactive interface with the power of Google's Gemini AI to create an engaging, gamified learning experience.

### ✨ Key Features
- 🤖 **Aura AI Assistant:** A fully integrated Gemini AI proxy that answers civic-related questions with context awareness.
- 🗺️ **3D Interactive Map:** A beautiful Three.js powered interactive map displaying real-time data for locations like Hyderabad, India.
- 🌓 **Dynamic Theming:** Seamless global Dark and Light (Professional) modes using custom CSS variables.
- 🔐 **Secure Backend Proxy:** API keys are never exposed to the browser. All AI requests route securely through a custom Express server.
- 🏆 **Gamified Learning & Dashboard:** Track student progress with a persistent data layer (Firebase/Supabase), earning XP and badges for completing learning milestones.
- 📜 **Election Timeline:** An interactive horizontal timeline that traces the historical journey of democratic elections.
- 📝 **AI-driven Quiz Generator:** Automatically generates civic-focused quizzes using Gemini AI to test user knowledge dynamically.
- 📱 **Progressive Web App (PWA):** Installable on mobile and desktop for offline-ready access.

### 🛠️ Technologies Used & How They Work
- **React 19 & TypeScript:** Builds the dynamic, component-based user interface with strict type-safety for a robust codebase.
- **Vite:** An ultra-fast build tool used to compile and bundle the frontend application for production.
- **Node.js & Express 5:** Acts as the backend server. It serves the static frontend and acts as a secure proxy for the Gemini API, ensuring API keys are never exposed to the client.
- **Google Gemini AI (2.5 & Flash):** The brain behind the Aura AI Assistant and dynamic Quiz Generator, providing real-time, context-aware civic knowledge.
- **Three.js & React Three Fiber:** Renders the stunning, interactive 3D elements, including the real-time globe and location maps.
- **Firebase / Supabase:** Provides the persistent data layer for user authentication, tracking student progress, XP, and earning badges.
- **Google Cloud Run & Docker:** Containerizes the entire application and deploys it to a serverless, highly scalable environment.
- **Vanilla CSS & Variables:** Powers the glassmorphism aesthetics and the seamless global Dark/Light mode toggle.

### 📴 Offline Support & How It Works
CivicBrain.AI is built as a **Progressive Web App (PWA)**, meaning it can work even without an internet connection. Here's how:

| Technology | Role |
|---|---|
| **`vite-plugin-pwa`** | Automatically generates a Service Worker at build time, handling all caching strategies without manual configuration. |
| **Service Worker** | A background script that intercepts network requests. When offline, it serves cached pages and assets instantly instead of showing a browser error. |
| **Cache API** | Stores all static assets (HTML, CSS, JS, images) locally on the user's device after the first visit, so subsequent loads are instant. |
| **Web App Manifest** (`manifest.json`) | Defines the app's name, icons, theme color, and display mode. This enables the browser's "Install App" prompt on mobile and desktop. |
| **localStorage** | Persists user preferences (like the Dark/Light theme toggle) across sessions, even when offline. |
| **Gemma 2B (via WebLLM)** | Google's lightweight open-source AI model that runs **entirely inside the browser** using WebGPU. When the user goes offline, the Aura AI Assistant automatically switches from cloud-based Gemini to the local Gemma model, so AI chat continues to work without internet. |
| **`@mlc-ai/web-llm`** | The Machine Learning Compilation engine that loads and runs the Gemma 2B model directly in the browser using WebGPU acceleration — no server needed. |

> **How it works in practice:**
> 1. The user visits the site for the first time → the Service Worker caches all assets in the background.
> 2. On the next visit (even without internet), the cached version loads instantly.
> 3. When online → the AI Assistant uses **Gemini (Cloud)** for fast, powerful responses.
> 4. When offline → the AI Assistant automatically falls back to **Gemma 2B (Local)**, running entirely in the browser via WebGPU — no internet required for AI chat!

---

## 🏗️ Architecture

This project uses a hybrid **Server-Side + Static Frontend** architecture optimized for containerized environments like **Google Cloud Run**.

1. **Frontend:** React + Vite (Compiled into static HTML/CSS/JS in the `dist/` folder).
2. **Backend Server:** Node.js + Express (`server.js`). This server acts as the entry point. It serves the static frontend files and provides the secure `/api/gemini` proxy for AI requests.
3. **Deployment:** Docker container (`Dockerfile`) configured to skip heavy builds in the cloud and instantly serve the pre-built application.

---

## 🚀 Local Development Setup

Follow these exact steps to run CivicBrain.AI on your local machine.

### 1. Prerequisites
- **Node.js** (v20 or higher recommended)
- **Git**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. Install Dependencies
Open your terminal and install all required Node modules:
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env` in the root folder (next to `package.json`) and add your Gemini API Key and other required variables:

```env
# AI Integration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Firebase/Supabase Configs (if applicable)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 4. Start the Development Server
To run the app locally with hot-reloading (for making frontend changes):
```bash
npm run dev
```
*The app will be available at `http://localhost:5173`.*

---

## ☁️ Deployment (Google Cloud Run)

We have perfectly optimized this project to be deployed flawlessly on Google Cloud Run without hitting memory limits. 

### Step 1: Build the Project Locally
Because cloud environments have strict memory limits, we build the heavy React code on your local computer first:
```bash
npm run build
```
*This generates a `dist/` folder containing your optimized production website.*

### Step 2: Deploy to Google Cloud Run
Make sure you have the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and you are logged in (`gcloud auth login`).

Run the deployment command:
```bash
gcloud run deploy civicbrain --source . --region us-central1 --allow-unauthenticated
```
**What happens here?** 
- Google Cloud reads the `Dockerfile`.
- The `.gcloudignore` file ensures the `node_modules` folder is skipped.
- The `dist/` folder is uploaded directly.
- Only lightweight production dependencies are installed (`npm install --omit=dev --legacy-peer-deps`).

### Step 3: Configure Live API Keys
Your live website **does not** automatically read your local `.env` file for the Gemini API Key. You must add it manually to Google Cloud:
1. Go to the [Google Cloud Run Console](https://console.cloud.google.com/run).
2. Click on the **`civicbrain`** service.
3. Click **Edit & Deploy New Revision**.
4. Go to the **Variables & Secrets** tab.
5. Click **Add Variable** and create a variable named `GEMINI_API_KEY`. Paste your key as the value.
6. Click **Deploy**.

---

## 📁 Project Structure

```text
📦 Civicbrain.ai
 ┣ 📂 dist/               # Compiled frontend code (Generated after build)
 ┣ 📂 public/             # Static assets (images, icons)
 ┣ 📂 src/                # React Source Code
 ┃ ┣ 📂 components/       # Reusable UI components
 ┃ ┣ 📂 pages/            # Application views (Dashboard, Admin, Assistant)
 ┃ ┣ 📜 App.tsx           # Main application routing and theme logic
 ┃ ┣ 📜 index.css         # Global CSS containing Light/Dark theme variables
 ┃ ┗ 📜 main.tsx          # React DOM entry point
 ┣ 📜 .env                # Local environment secrets (DO NOT COMMIT)
 ┣ 📜 .gcloudignore       # Google Cloud build exclusion rules
 ┣ 📜 Dockerfile          # Cloud Run container configuration
 ┣ 📜 package.json        # Dependencies and scripts
 ┗ 📜 server.js           # Express Backend & API Proxy
```

---
<div align="center">
  <p>Built with ❤️ for Civic Education.</p>
</div>
