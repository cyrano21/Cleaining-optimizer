'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LESSONS } from '@/data/lessons';

interface LessonPageParams {
  moduleId: string;
  lessonId: string;
}

export default function LessonPage({ params }: { params: LessonPageParams }) {
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const moduleNumber = parseInt(params.moduleId, 10);
    const lessonNumber = parseInt(params.lessonId, 10);

    if (isNaN(moduleNumber) || isNaN(lessonNumber)) {
      setError('Invalid module or lesson ID');
      setIsLoading(false);
      return;
    }

    try {
      const module = LESSONS[moduleNumber - 1];
      if (!module) {
        setError('Module not found');
        setIsLoading(false);
        return;
      }

      const lesson = module.lessons[lessonNumber - 1];
      if (!lesson) {
        setError('Lesson not found');
        setIsLoading(false);
        return;
      }

      setLesson(lesson);
      setIsLoading(false);
    } catch (err) {
      setError('Error loading lesson');
      setIsLoading(false);
    }
  }, [params.moduleId, params.lessonId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      <div className="prose max-w-none">
        {lesson.content}
      </div>
    </div>
  );
}
