import { normalizeCourse, validateCourse } from "./lessons.js";

const COURSE_INDEX_URL = "content/courses/index.json";

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Cannot load ${url}: ${response.status}`);
  }

  return response.json();
}

export async function loadCourseCatalog() {
  return loadJson(COURSE_INDEX_URL);
}

export async function loadCourse(courseId, catalog) {
  const entry = catalog.find((item) => item.id === courseId) || catalog[0];
  if (!entry) {
    throw new Error("No courses are configured.");
  }

  return loadJson(entry.courseUrl);
}

export function prepareLessons(course, keyboardLayout) {
  const problems = validateCourse(course, keyboardLayout);
  if (problems.length) {
    console.warn("Course validation warnings:", problems);
  }

  return normalizeCourse(course, keyboardLayout);
}
