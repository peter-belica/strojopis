export type Language = 'cs-cz' | 'en-gb';
export interface Target { char: string; code: string; shift?: boolean; altGraph?: boolean }
export interface Lesson { id: string; name: string; phase: string; description: string; text: string; targets: Target[]; textId?: string; difficulty?: number; allowedCharacters?: string[]; fallback?: boolean }
export interface TrainingResult { id: string; lessonId: string; textId: string; language: Language; difficulty: number; attempts: number; errors: number; accuracy: number; durationMs: number; length: number; completedAt: string }
export interface Summary { completedAttempts: number; bestResult: TrainingResult; lastResult: TrainingResult }
export interface CourseProgress { lastLessonId: string; lessons: Record<string, Summary> }
export interface Profile { id: string; name: string; keyboardModel: string; languageLayout: Language; difficulty: number; guideEnabled: boolean; createdAt: string; updatedAt: string; courses: Partial<Record<Language, CourseProgress>>; history: TrainingResult[] }
export interface AppData { schemaVersion: 2; activeProfileId: string | null; profiles: Profile[] }
export interface Sentence { id: string; language: Language; difficulty: number; text: string; topics: string[] }
export interface KeyboardLayout { id: string; name: string; labels: Record<string, string>; charMap: Record<string, { code: string; shift?: boolean; altGraph?: boolean }> }
export interface CourseLesson { id: string; name: string; phase: string; description: string; introducedKeys: string[]; introducedCharacters: string[]; blocks: { type: string; text: string }[] }
export interface Course { id: Language; name: string; keyboardLayoutId: string; lessons: CourseLesson[] }
