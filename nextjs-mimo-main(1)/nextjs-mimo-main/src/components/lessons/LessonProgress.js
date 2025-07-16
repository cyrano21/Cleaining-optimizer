"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * @typedef {Object} LessonProgressProps
 * @property {string} currentLessonId - The ID of the current lesson (e.g., "1-1", "moduleid-lessonNum").
 * @property {string} moduleId - The ID of the current module (e.g., "1").
 * @property {boolean} [isPrevLessonAvailable] - Whether a previous lesson link should be active.
 * @property {boolean} [isNextLessonAvailable] - Whether a next lesson link should be active.
 * @property {'light' | 'dark'} [theme='light'] - The theme for the component.
 */

/**
 * LessonProgress component.
 * @param {LessonProgressProps} props
 */
export default function LessonProgress({
  currentLessonId, // Full lesson ID e.g., "1-2"
  moduleId,
  availableLessons,
  theme: parentTheme = "light",
}) {
  const isPrevLessonAvailable = !!availableLessons?.prev;
  const isNextLessonAvailable = !!availableLessons?.next;
  const [localTheme, setLocalTheme] = useState(parentTheme);

  useEffect(() => {
    setLocalTheme(parentTheme);
  }, [parentTheme]);

  const theme = localTheme;

  return (
    <div className={`flex items-center space-x-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
      {isPrevLessonAvailable && (
        <Link
          href={`/lessons/module/${moduleId}/lesson/${availableLessons.prev.id.split('-')[1]}`}
          className={`btn btn-sm ${theme === 'dark' ? 'btn-accent' : 'btn-outline'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {availableLessons.prev.title}
        </Link>
      )}
      <div className="flex items-center space-x-2">
        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {currentLessonId}
        </span>
      </div>
      {isNextLessonAvailable && (
        <Link
          href={`/lessons/module/${moduleId}/lesson/${availableLessons.next.id.split('-')[1]}`}
          className={`btn btn-sm ${theme === 'dark' ? 'btn-accent' : 'btn-outline'}`}
        >
          {availableLessons.next.title}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}