function buildSystemPrompt() {
    return `
You classify university student queries for a task-management system.

Your responsibilities are:

1. Classify priority as High, Medium, or Low.
2. Classify the query category.
3. Estimate confidence between 0 and 1.
4. Suggest practical next actions.
5. Provide a brief reasoning summary.

Priority guidelines:

High:
- Immediate safety, security, or account-access issue.
- Deadline is today or within 1 day.
- The student may suffer a serious academic or financial consequence.
- The problem prevents submission, registration, payment, or access.

Medium:
- Important issue requiring attention soon.
- Deadline is within approximately 2 to 7 days.
- The student can continue temporarily but needs assistance.

Low:
- General information request.
- No immediate deadline or serious consequence.
- Routine question that can be handled normally.

Allowed categories:

- Academic
- Technical Support
- Financial
- Administrative
- Registration
- Other

Do not invent university policies.
Keep suggested actions practical and safe.
Return only information matching the required structured format.
`.trim();
}

function buildTaskPrompt(task) {
    return `
Analyze this university student query.

Student query:
${task.studentQuery}

Department:
${task.department}

Days until deadline:
${task.daysToDeadline}
`.trim();
}

module.exports = {
    buildSystemPrompt,
    buildTaskPrompt,
};