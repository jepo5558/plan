const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const indexPath = path.join(rootDir, "data", "plans-index.json");
const localIndexPath = path.join(rootDir, "data", "local-plans-index.json");

const allowedPlanStatuses = new Set(["planned", "active", "blocked", "review", "done", "archived"]);
const allowedTaskStatuses = new Set(["todo", "doing", "blocked", "done"]);
const allowedPriorities = new Set(["high", "medium", "low"]);
const allowedContexts = new Set(["personal", "work"]);

const requiredFields = [
  "id",
  "title",
  "context",
  "agent",
  "project",
  "status",
  "priority",
  "createdAt",
  "updatedAt",
  "originalRequest",
  "interpretedGoal",
  "tasks",
  "updates",
  "visibility"
];

function main() {
  const errors = [];
  const planPaths = [
    ...readPlanIndex(indexPath, errors),
    ...readPlanIndex(localIndexPath, errors, true)
  ];

  if (!Array.isArray(planPaths)) {
    errors.push("Plan indexes must be arrays of plan file paths.");
    finish(errors);
    return;
  }

  const seenPaths = new Set();

  for (const relativePath of planPaths) {
    validatePlanPath(relativePath, seenPaths, errors);

    const absolutePath = path.join(rootDir, relativePath);
    const plan = readJson(absolutePath, errors);

    if (!plan) {
      continue;
    }

    validatePlan(relativePath, plan, errors);
  }

  finish(errors);
}

function readPlanIndex(filePath, errors, optional = false) {
  if (optional && !fs.existsSync(filePath)) {
    return [];
  }

  const planPaths = readJson(filePath, errors);

  if (!Array.isArray(planPaths)) {
    errors.push(`${path.relative(rootDir, filePath)} must be an array of plan file paths.`);
    return [];
  }

  return planPaths;
}

function validatePlanPath(relativePath, seenPaths, errors) {
  if (typeof relativePath !== "string") {
    errors.push("Every plans-index entry must be a string.");
    return;
  }

  if (seenPaths.has(relativePath)) {
    errors.push(`Duplicate plans-index entry: ${relativePath}`);
  }

  seenPaths.add(relativePath);

  if (!relativePath.startsWith("data/plans/") && !relativePath.startsWith("data/local-plans/")) {
    errors.push(`${relativePath}: path must start with data/plans/ or data/local-plans/.`);
  }

  if (!relativePath.endsWith(".json")) {
    errors.push(`${relativePath}: path must end with .json.`);
  }

  const absolutePath = path.join(rootDir, relativePath);

  if (!absolutePath.startsWith(rootDir)) {
    errors.push(`${relativePath}: path escapes repository root.`);
  }

  if (!fs.existsSync(absolutePath)) {
    errors.push(`${relativePath}: file does not exist.`);
  }
}

function validatePlan(relativePath, plan, errors) {
  for (const field of requiredFields) {
    if (!(field in plan)) {
      errors.push(`${relativePath}: missing required field "${field}".`);
    }
  }

  const parts = relativePath.split(/[\\/]/);
  const isLocalPath = parts[1] === "local-plans";
  const contextFromPath = isLocalPath ? parts[2] : parts[2];
  const agentFromPath = isLocalPath ? parts[3] : parts[3];
  const fileId = path.basename(relativePath, ".json");

  if (plan.id !== fileId) {
    errors.push(`${relativePath}: id must match file name "${fileId}".`);
  }

  if (plan.context !== contextFromPath) {
    errors.push(`${relativePath}: context must match path context "${contextFromPath}".`);
  }

  if (plan.agent !== agentFromPath) {
    errors.push(`${relativePath}: agent must match path agent "${agentFromPath}".`);
  }

  if (!allowedContexts.has(plan.context)) {
    errors.push(`${relativePath}: invalid context "${plan.context}".`);
  }

  if (!allowedPlanStatuses.has(plan.status)) {
    errors.push(`${relativePath}: invalid plan status "${plan.status}".`);
  }

  if (!allowedPriorities.has(plan.priority)) {
    errors.push(`${relativePath}: invalid priority "${plan.priority}".`);
  }

  if (!isValidDate(plan.createdAt)) {
    errors.push(`${relativePath}: createdAt must be a valid date string.`);
  }

  if (!isValidDate(plan.updatedAt)) {
    errors.push(`${relativePath}: updatedAt must be a valid date string.`);
  }

  if (!Array.isArray(plan.tasks)) {
    errors.push(`${relativePath}: tasks must be an array.`);
  } else {
    plan.tasks.forEach((task, index) => validateTask(relativePath, task, index, errors));
  }

  if (!Array.isArray(plan.updates)) {
    errors.push(`${relativePath}: updates must be an array.`);
  }
}

function validateTask(relativePath, task, index, errors) {
  if (!task.id) {
    errors.push(`${relativePath}: tasks[${index}] is missing id.`);
  }

  if (!task.title) {
    errors.push(`${relativePath}: tasks[${index}] is missing title.`);
  }

  if (!allowedTaskStatuses.has(task.status)) {
    errors.push(`${relativePath}: tasks[${index}] has invalid status "${task.status}".`);
  }
}

function readJson(filePath, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(rootDir, filePath)}: ${error.message}`);
    return null;
  }
}

function isValidDate(value) {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function finish(errors) {
  if (errors.length > 0) {
    console.error("Plan validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log("Plan validation passed.");
}

main();
