# Inclusive Smart Classroom Platform (SIH Prototype)

> **Theme:** Smart Education  
> **Problem Statement:** Smart Classroom Management Software  
> **Principle:** Adapt classroom support to individual needs without publicly labeling, ranking, or comparing students.

The **Inclusive Smart Classroom Management Platform** is a full-stack, privacy-aware smart education system designed for the Smart India Hackathon (SIH). It goes beyond traditional college ERP systems by focusing on privacy-aware support signals, confidential student help requests, class continuity packages for missed classes, and inclusive accessibility preferences.

---

## 🌟 Key Features & Core Differentiators

1. **Privacy-Aware Support Signals**: Automated deterministic engine detecting negative activity/performance drops (attendance shifts, assessment drops) and generating private assistive alerts for authorized teachers with compulsory disclaimers (*"This is an assistive signal, not a diagnosis."*).
2. **Private Ask for Help System**: Students confidentially submit questions on specific topics. Teachers see aggregated classroom confusion trends by default, with controlled private follow-up access.
3. **Class Continuity Packages**: Teachers publish structured catch-up packages for missed classes containing lecture summary notes, reading links, videos, assignments, and quizzes. Students mark tasks complete and track progress %.
4. **Inclusive Classroom Preferences**: Students manage language (English / Telugu), captioning, visual preferences, and notes. Teachers receive actionable accessibility insights without unnecessary personal data exposure.
5. **Multilingual UI (English & Telugu)**: Instant interface language switching across all pages.
6. **Role-Based Access Control**: Scoped portals for **Student**, **Teacher**, and **Admin**.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router v6, Lucide Icons, Recharts, Tailwind CSS.
- **Backend**: Node.js, Express.js REST API, JWT Authentication, bcrypt password hashing.
- **Database**: SQLite3 (normalized database abstraction layer).

---

## 🚀 Quick Start & Environment Setup

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed
npm start
```
The backend API will start at `http://localhost:5000`.

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start at `http://localhost:3000`.

---

## 🔑 Pre-Configured Demo Credentials

| Role | Email | Password | Workflow Highlight |
| :--- | :--- | :--- | :--- |
| **Student** | `student.rahul@classroom.edu` | `student123` | Missed class continuity package completion |
| **Student** | `student.ananya@classroom.edu` | `student123` | Private help request submission |
| **Student** | `student.priya@classroom.edu` | `student123` | Privacy-aware assistive signal trigger |
| **Teacher** | `teacher.sharma@classroom.edu` | `teacher123` | Aggregated topic confusion & support signals |
| **Admin** | `admin@classroom.edu` | `admin123` | System analytics & smart classroom management |

---

## 📑 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md): System data flow, privacy boundaries, database schema, and smart signal logic.
- [DEMO_GUIDE.md](docs/DEMO_GUIDE.md): Step-by-step SIH judge demonstration script.
