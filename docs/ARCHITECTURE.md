# Inclusive Smart Classroom - Architecture & Design Document

## 1. System Architecture Overview

```text
+-----------------------------------------------------------------------+
|                            React Frontend                             |
|    Vite + React Router + Recharts + Tailwind CSS + i18n (EN/TE)       |
+-----------------------------------------------------------------------+
                                   |
                             REST API (JSON)
                                   v
+-----------------------------------------------------------------------+
|                          Node.js Express API                          |
|  JWT Auth | Role-Based Authorization | Smart Support Signal Engine    |
+-----------------------------------------------------------------------+
                                   |
                                 SQL DAO
                                   v
+-----------------------------------------------------------------------+
|                         SQLite Database                               |
|   Users, Students, Teachers, Classrooms, Subjects, Enrollments,       |
|   Activity, Help Requests, Support Signals, Continuity Packages       |
+-----------------------------------------------------------------------+
```

---

## 2. Privacy Scoping & Security Rules

1. **Student Scoping**: Students can ONLY view their own profile, enrolled classes, own submitted help requests, own progress, and assigned continuity packages. Students CANNOT see other students' help requests, support signals, or rankings.
2. **Teacher Scoping**: Teachers can ONLY view classes assigned to them. Teachers see AGGREGATED topic confusion counts by default, preventing public student labeling. Teachers access support signals ONLY for students in their assigned sections.
3. **Assistive Support Signals**: Backend engine operates deterministically on activity/performance records (14-day window). Generates neutral support alerts with mandatory disclaimer: *"This is an assistive signal, not a diagnosis."*

---

## 3. Database Schema Diagram (Entities & Relationships)

- **`users`** `(id, name, email, password_hash, role)`
- **`students`** `(id, user_id, roll_number, grade_level, section)`
- **`teachers`** `(id, user_id, department, designation)`
- **`classrooms`** `(id, room_number, building, capacity, features)`
- **`subjects`** `(id, code, name, description)`
- **`classes`** `(id, subject_id, teacher_id, classroom_id, name, schedule_time)`
- **`enrollments`** `(id, student_id, class_id)`
- **`activity_performance`** `(id, student_id, class_id, record_date, attendance_status, participation_score, quiz_score)`
- **`help_topics`** `(id, subject_id, name)`
- **`help_requests`** `(id, student_id, class_id, topic_id, description, status)`
- **`support_signals`** `(id, student_id, class_id, category, severity, metric_summary, disclaimer, status, teacher_notes)`
- **`continuity_packages`** `(id, class_id, teacher_id, title, class_date, summary_notes)`
- **`continuity_tasks`** `(id, package_id, title, task_type, resource_link, order_index)`
- **`student_task_progress`** `(id, student_id, task_id, completed, completed_at)`
- **`student_preferences`** `(id, student_id, language, accessibility_needs, captioning_enabled, preferred_format)`
