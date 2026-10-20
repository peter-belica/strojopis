export type Language = 'cs-cz' | 'en-gb';
export type KeyboardLocale = 'sk-sk' | 'cs-cz' | 'es-es' | 'en-us' | 'en-gb';
export type KeyboardPlatform = 'mac' | 'windows';
export interface KeyboardStroke { code: string; modifiers?: string[]; dead?: boolean }
export interface KeyboardMapping { code: string; shift?: boolean; altGraph?: boolean; steps?: KeyboardStroke[] }
export interface Target extends KeyboardMapping { char: string }
export interface Lesson { id: string; name: string; phase: string; description: string; text: string; targets: Target[]; textId?: string; textIds?: string[]; sentenceCount?: number; sentenceEnds?: number[]; exerciseVersion?: number; difficulty?: number; allowedCharacters?: string[]; fallback?: boolean }
export interface TrainingResult { id: string; lessonId: string; textId: string; textIds?: string[]; sentenceCount?: number; exerciseVersion?: number; language: Language; difficulty: number; attempts: number; errors: number; accuracy: number; durationMs: number; length: number; completedAt: string }
export interface Summary { completedAttempts: number; bestResult: TrainingResult; lastResult: TrainingResult; bestByFormat?: Record<string, TrainingResult> }
export interface CourseProgress { lastLessonId: string; lessons: Record<string, Summary> }
export interface Profile { id: string; name: string; keyboardModel: string; languageLayout: Language; keyboardLocale: KeyboardLocale; keyboardPlatform: KeyboardPlatform; difficulty: number; guideEnabled: boolean; createdAt: string; updatedAt: string; courses: Partial<Record<Language, CourseProgress>>; history: TrainingResult[] }
export interface AppData { schemaVersion: 3; activeProfileId: string | null; profiles: Profile[] }
export interface Sentence { id: string; language: Language; difficulty: number; text: string; topics: string[] }
export interface KeyboardLayout { id: string; name: string; platform?: KeyboardPlatform; labels: Record<string, string>; charMap: Record<string, KeyboardMapping> }
export interface KeyGeometry { code: string; x: number; y: number; width: number; height: number; shape?: string; label?: string; pressX?: number; pressY?: number }
export interface KeyboardModel { id: string; name: string; variant: 'iso' | 'ansi'; width: number; height: number; keys: KeyGeometry[]; rows: string[][] }
export interface CourseLesson { id: string; name: string; phase: string; description: string; introducedKeys: string[]; introducedCharacters: string[]; blocks: { type: string; text: string }[] }
export interface Course { id: Language; name: string; keyboardLayoutId: string; lessons: CourseLesson[] }
