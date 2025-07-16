// Import and re-export from the lessons directory
import { getLesson, getModuleLessons, getAllLessons, LESSONS } from './lessons/index';

export { getLesson, getModuleLessons, getAllLessons, LESSONS };

// Default export for backward compatibility
export default LESSONS;
