import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // Keep versioned JSON available through fetch in the static build.
  publicDir: false,
  plugins: [{
    name: 'course-content',
    async closeBundle() {
      const { cp } = await import('node:fs/promises');
      await cp('content', 'dist/content', { recursive: true });
    }
  }],
  test: { include: ['tests/*.test.js'] }
});
