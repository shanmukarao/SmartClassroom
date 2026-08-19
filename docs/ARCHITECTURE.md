# Inclusive Smart Classroom — Architecture & Design Document

## 1. System Architecture Overview

```text
+-----------------------------------------------------------------------+
|                            React Frontend                             |
|    Vite + React Router + Recharts + Tailwind CSS + i18n (EN/TE)       |
+-----------------------------------------------------------------------+
                                   |
                   Client-Side Service Abstraction Layer
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    Browser LocalStorage Engine                        |
|  mockDataService.js • Pure Synchronous/Async Storage Manager           |
|  - Users & Session Management (`smartclassroom_users`)               |
|  - Classes & Subjects (`smartclassroom_classes`, `subjects`)           |
|  - Help Requests & Aggregated Insights (`smartclassroom_help_requests`)|
|  - Deterministic Support Signals (`smartclassroom_support_signals`)    |
|  - Class Continuity Packages & Progress (`smartclassroom_task_progress`)|
|  - Inclusive Preferences & Multilingual Dictionary (`locales/`)       |
+-----------------------------------------------------------------------+
```

### Serverless Architecture Rationale
- **100% GitHub Pages Compatible**: Zero server side dependencies (Express/Node.js/SQL) required.
- **Persistent Demo Data Store**: All mutations (help request submissions, continuity package creation, task completion checkboxes, preferences) persist in browser `localStorage`.
- **Future Microservice Ready**: The UI layer interfaces exclusively via `services/api.js`. In the future, replacing `api.js` internal calls with Axios HTTP calls connects to a remote REST microservice without altering a single UI component.

---

## 2. Privacy Scoping & Core Principles

1. **Anti-Labeling Policy**: The platform explicitly forbids labels such as *"Weak student"*, *"Poor student"*, *"Low performer"*, or public leaderboards.
2. **Aggregated Teacher Insights**: Teachers see topic confusion trends (e.g. *"7 students requested clarification on Recursion"*) aggregated at the subject/class level without exposing student names in public views.
3. **Assistive Support Signals**: Rule-based engine evaluates attendance and performance trends deterministically and outputs private alerts to authorized teachers with the mandatory disclaimer:
   > *"This is an assistive signal, not a diagnosis."*
4. **Student Privacy Isolation**: Students can ONLY view their own profile, schedule, progress, submitted help queries, and catch-up packages.

---

## 3. Data Schema & LocalStorage Keys

- **`smartclassroom_users`**: Array of user profiles (students, teachers, admins).
- **`smartclassroom_subjects`**: Subject registry (Data Structures, DBMS, Networks, OS, Web Dev).
- **`smartclassroom_rooms`**: Classroom facilities and accessibility features.
- **`smartclassroom_classes`**: Academic class schedules and section assignments.
- **`smartclassroom_help_requests`**: Private help requests submitted by students.
- **`smartclassroom_support_signals`**: Private, rule-based assistive alerts for teachers.
- **`smartclassroom_continuity_packages`**: Structured catch-up packages published by teachers.
- **`smartclassroom_task_progress`**: Student checklist item completion status.
- **`smartclassroom_preferences`**: Language and non-sensitive accessibility preferences.
