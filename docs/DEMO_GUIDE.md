# SIH Judge Demonstration Guide — Inclusive Smart Classroom

Follow this step-by-step demonstration script during Smart India Hackathon judging to showcase the complete working prototype:

---

## 🎬 Step-by-Step SIH Demonstration Script

### STEP 1 — STUDENT LOGIN
1. Open the application landing page.
2. Click **"Login as Student"** (or enter Email: `student@example.com` / Password: `student123`).
3. View the **Student Dashboard**:
   - Registered class schedule (Data Structures, DBMS, OS).
   - Personal attendance rate (92%) and quiz average (86%).
   - Missed class continuity package banner (*Data Structures — Recursion*).
   - Note: Zero public student rankings or comparisons.

---

### STEP 2 — SUBMIT PRIVATE "ASK FOR HELP"
1. Click the **"Ask for Help"** button.
2. Select Subject: `Data Structures — CSE A`.
3. Select Topic Area: `Recursion`.
4. Enter Description: *"I don't understand how recursive call stack unwinding works."*
5. Click **Submit**.
6. Observe confirmation message: *"Your request has been submitted privately."*
7. Request is saved directly to `localStorage`.

---

### STEP 3 — TEACHER LOGIN & AGGREGATED HELP INSIGHTS
1. Click **Logout**, then click **"Login as Teacher"** (`teacher@example.com` / `teacher123`).
2. Navigate to **Aggregated Help Insights** / **Topic Confusion Chart**.
3. View Topic Confusion:
   - Notice: **"7 students requested clarification on Recursion"** is displayed at the topic aggregate level.
   - **Privacy Principle**: The individual student's identity is NOT publicly displayed or ranked.

---

### STEP 4 — PRIVATE SUPPORT SIGNAL CHECK
1. View the **Authorized Private Support Signals** section on the Teacher Dashboard.
2. Locate the realistic assistive support signal:
   - Alert: *"This student shows a recent decline in participation and performance. Consider checking in."*
   - Mandatory Disclaimer: *"This is an assistive signal, not a diagnosis."*
3. Verify that only the authorized teacher can view individual support signals.

---

### STEP 5 — CREATE CLASS CONTINUITY PACKAGE
1. Click **"Create Continuity Package"**.
2. Select Class: `Data Structures — CSE A`.
3. Title: `Data Structures — Recursion`.
4. Add summary notes, lecture video link, assignment details, and checklist items:
   - [ ] Read lecture notes on Recursion & Call Stacks
   - [ ] Review resource video (15 mins)
   - [ ] Complete 3 recursion practice exercises
   - [ ] Review key concepts & self-check base case logic
5. Click **Save**.

---

### STEP 6 — ABSENT STUDENT CATCH-UP & PROGRESS
1. Logout and log in as absent Student (`student@example.com`).
2. Navigate to **Missed Classes** / **Continuity Packages**.
3. Open package: **Data Structures — Recursion**.
4. Check off checklist tasks one by one:
   - Progress bar updates dynamically: **0/4 (0%) → 1/4 (25%) → 2/4 (50%) → 3/4 (75%) → 4/4 (100%)**.
5. Displays **"100% Completed — Catch-up complete."**

---

### STEP 7 — CLASSROOM ANALYTICS & DEMO RESET
1. Logout and log in as **Admin** (`admin@example.com` / `admin123`).
2. View **Admin Dashboard**:
   - Institutional classroom utilization table, aggregate attendance, total help requests.
   - Note: No public student rankings or comparative leaderboards.
3. Test **Reset Demo Data** button in top header to restore initial seed state for the next judge evaluation.
