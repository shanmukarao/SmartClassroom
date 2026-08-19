# Inclusive Smart Classroom Platform (SIH Prototype)

> **SIH PS ID:** NRIIT-EDU-01  
> **Theme:** Smart Education  
> **Core Principle:** "A smart classroom that adapts to student needs without compromising their privacy or dignity."

The **Inclusive Smart Classroom Management Platform** is a 100% standalone, browser-native smart education web prototype built for the Smart India Hackathon (SIH). It runs entirely in the browser using a LocalStorage service layer with zero backend or API server dependencies, making it deployable directly to **GitHub Pages**.

---

## 🌟 Key Features & Core Differentiators

1. **Private "Ask for Help" System**: Students confidentially submit topic-specific questions. Teachers see aggregated classroom confusion insights (e.g., *"7 students requested clarification on Recursion"*) without publicly exposing student identities.
2. **Privacy-Aware Support Signals**: Deterministic engine analyzing attendance, participation, and continuous assessment trends to generate assistive alerts for authorized teachers (e.g., *"This student shows a recent decline in participation and performance. Consider checking in."*). Includes mandatory disclaimers (*"This is an assistive signal, not a diagnosis."*).
3. **Class Continuity Packages**: Structured catch-up packages for missed classes containing summary notes, resource links, assignments, and interactive checklists. Students track real-time catch-up progress (0% to 100%).
4. **Inclusive Classroom Preferences**: Non-sensitive accessibility preferences (language preference, captions, visual/audio/text format, high contrast) configurable by students and visible to teachers for classroom planning.
5. **Multilingual Support**: Centralized English (`en.js`) and Telugu (`te.js`) dictionary with instant one-click language switching.
6. **Role-Based Access Control**: Scoped, role-protected portals for **Student**, **Teacher**, and **Admin**.
7. **Demo Data Reset**: One-click action in Admin/Settings to restore initial seed data anytime for repeatable demonstrations.

---

## 🛠️ Technology Stack & Architecture

- **Frontend Core**: React 18 (Vite), React Router v6, Tailwind CSS, Lucide Icons, Recharts.
- **Data & Mock Service Layer**: LocalStorage Data Persistence (`mockDataService.js` / `seedData.js`). Zero REST backend, zero Express, zero external databases.
- **Deployment**: Configured with relative asset paths (`base: './'`) for static deployment on **GitHub Pages**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Quick Workflow |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `student123` | Rahul Sharma (CSE-A) • Ask for Help & Missed Class Catch-Up |
| **Teacher** | `teacher@example.com` | `teacher123` | Dr. A. Sharma (CSE) • Aggregated Help Insights & Support Signals |
| **Admin** | `admin@example.com` | `admin123` | System Administrator • Institutional Analytics & Data Reset |

---

## 🚀 How to Run Locally

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📦 How to Deploy to GitHub Pages

1. Build the production static bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. The compiled static website files will be generated in `frontend/dist`.
3. GitHub Actions (`.github/workflows/deploy.yml`) automatically builds and deploys `frontend/dist` to GitHub Pages upon pushing to the `main` branch.

---

## 📑 Detailed Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md): LocalStorage data flow, privacy boundaries, and smart signal deterministic rules.
- [DEMO_GUIDE.md](docs/DEMO_GUIDE.md): Step-by-step SIH judge demonstration walkthrough.
