import { readFile } from 'node:fs/promises';
import { validateSentences } from '../assets/js/sentences.js';
import { validateCourse, normalizeCourse } from '../assets/js/lessons.js';
import { COURSE_LESSON_IDS } from '../assets/js/data-model.js';
const read = async path => JSON.parse(await readFile(new URL(`../content/${path}`, import.meta.url), 'utf8'));
const all = [], problems = [];
for (const language of ['cs-cz','en-gb']) {
  const [sentences, course, layout] = await Promise.all([read(`sentences/${language}.json`), read(`courses/${language}.json`), read(`keyboard-layouts/${language}.json`)]);
  all.push(...sentences);
  problems.push(...validateCourse(course, layout));
  for (const lesson of course.lessons) if (!COURSE_LESSON_IDS[language].includes(lesson.id)) problems.push(`Unknown lesson ${lesson.id}`);
  for (const sentence of sentences) for (const char of sentence.text) if (!Object.hasOwn(layout.charMap, char)) problems.push(`Unknown character ${char}: ${sentence.id}`);
  for (const lesson of normalizeCourse(course, layout)) {
    if (!lesson.targets.every(t => lesson.allowedCharacters.includes(t.char))) problems.push(`Untaught character in ${lesson.id}`);
  }
  console.log(`${language}: ${sentences.length} viet, ${course.lessons.length} lekcií.`);
}
problems.push(...validateSentences(all));
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`OK: ${all.length} originálnych viet, 30 v každej kombinácii jazyka a úrovne.`);
