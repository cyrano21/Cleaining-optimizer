'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLesson } from '@/data/lessons';

interface LessonPageParams {
  moduleId: string;
  lessonId: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string | React.ReactNode;
  // Add other lesson properties as needed
  [key: string]: any;
}

export default function LessonPage({ params }: { params: LessonPageParams }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const moduleNumber = parseInt(params.moduleId, 10);
    const lessonNumber = parseInt(params.lessonId, 10);

    if (isNaN(moduleNumber) || isNaN(lessonNumber)) {
      setError('Invalid module or lesson ID');
      setIsLoading(false);
      return;
    }

    try {
      const foundLesson = getLesson(moduleNumber.toString(), lessonNumber.toString());
      
      if (!foundLesson) {
        setError('Lesson not found');
        setIsLoading(false);
        return;
      }

      setLesson(foundLesson);
      setIsLoading(false);
    } catch (err) {
      setError('Error loading lesson');
      setIsLoading(false);
      console.error('Error loading lesson:', err);
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
