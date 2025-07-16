import { Exercise, Quiz } from '../app/lessons/module/[moduleId]/lesson/[lessonId]/LessonContent';

declare module '@/components/lessons/ExerciseComponent' {
  import { FC } from 'react';
  
  interface ExerciseComponentProps {
    exercise: Exercise;
    theme?: string;
    onComplete?: () => void;
  }
  
  const ExerciseComponent: FC<ExerciseComponentProps>;
  export default ExerciseComponent;
}

declare module '@/components/lessons/QuizComponent' {
  import { FC } from 'react';
  
  interface QuizComponentProps {
    quiz: Quiz;
    theme?: string;
    onComplete?: () => void;
  }
  
  const QuizComponent: FC<QuizComponentProps>;
  export default QuizComponent;
}
