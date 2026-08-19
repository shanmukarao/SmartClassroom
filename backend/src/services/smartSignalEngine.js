const { query, run, get } = require('../db/database');

/**
 * Deterministic Engine for Privacy-Aware Smart Support Signals.
 * Analyzes activity & performance data without medical/psychological diagnosis claims.
 * Uses neutral assistive language strictly.
 */
async function evaluateStudentSupportSignals(studentId, classId) {
  try {
    // 1. Fetch recent activity performance records for student in class (last 30 days)
    const records = await query(
      `SELECT * FROM activity_performance 
       WHERE student_id = ? AND class_id = ? 
       ORDER BY record_date DESC LIMIT 14`,
      [studentId, classId]
    );

    if (!records || records.length < 3) {
      return null; // Not enough data points to compute trend
    }

    // Split records into recent 7 entries vs prior 7 entries
    const recent = records.slice(0, 7);
    const prior = records.slice(7, 14);

    if (prior.length === 0) return null;

    // Calculate recent metrics
    const recentAbsentCount = recent.filter(r => r.attendance_status === 'absent').length;
    const recentQuizAvg = recent.reduce((sum, r) => sum + (r.quiz_score || 0), 0) / recent.length;
    const priorQuizAvg = prior.reduce((sum, r) => sum + (r.quiz_score || 0), 0) / prior.length;

    const recentPartAvg = recent.reduce((sum, r) => sum + (r.participation_score || 0), 0) / recent.length;
    const priorPartAvg = prior.reduce((sum, r) => sum + (r.participation_score || 0), 0) / prior.length;

    let category = null;
    let severity = 'low';
    let metricSummary = '';

    // Check Trigger 1: Consecutive or frequent absences
    if (recentAbsentCount >= 3) {
      category = 'Classroom Continuity & Attendance';
      severity = recentAbsentCount >= 5 ? 'high' : 'medium';
      metricSummary = `Missed ${recentAbsentCount} recent class sessions. Student may benefit from class continuity package review and check-in.`;
    }
    // Check Trigger 2: Meaningful Quiz score drop (> 25% drop)
    else if (priorQuizAvg > 0 && ((priorQuizAvg - recentQuizAvg) / priorQuizAvg) >= 0.25) {
      const dropPct = Math.round(((priorQuizAvg - recentQuizAvg) / priorQuizAvg) * 100);
      category = 'Academic Understanding Trend';
      severity = dropPct > 40 ? 'high' : 'medium';
      metricSummary = `Observed a ${dropPct}% drop in recent assessment performance compared to baseline. May benefit from concept review.`;
    }
    // Check Trigger 3: Participation drop
    else if (priorPartAvg > 0 && ((priorPartAvg - recentPartAvg) / priorPartAvg) >= 0.35) {
      category = 'Classroom Engagement Trend';
      severity = 'low';
      metricSummary = `Recent classroom interaction score has softened relative to previous weeks. Gentle check-in recommended.`;
    }

    if (!category) {
      return null; // No concern detected
    }

    // Check if an active signal already exists to avoid duplication
    const existingSignal = await get(
      `SELECT id FROM support_signals 
       WHERE student_id = ? AND class_id = ? AND category = ? AND status = 'active'`,
      [studentId, classId, category]
    );

    if (existingSignal) {
      return existingSignal.id;
    }

    // Insert new signal
    const result = await run(
      `INSERT INTO support_signals 
       (student_id, class_id, category, severity, metric_summary, disclaimer, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'This is an assistive signal, not a diagnosis.', 'active', CURRENT_TIMESTAMP)`,
      [studentId, classId, category, severity, metricSummary]
    );

    return result.id;
  } catch (error) {
    console.error('Error evaluating support signals:', error);
    return null;
  }
}

async function runGlobalSignalEvaluation() {
  try {
    const enrollments = await query(`SELECT student_id, class_id FROM enrollments`);
    for (const item of enrollments) {
      await evaluateStudentSupportSignals(item.student_id, item.class_id);
    }
  } catch (error) {
    console.error('Error running global signal evaluation:', error);
  }
}

module.exports = {
  evaluateStudentSupportSignals,
  runGlobalSignalEvaluation
};
