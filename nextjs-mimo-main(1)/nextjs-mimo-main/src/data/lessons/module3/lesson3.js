import part1 from './lesson3-part1';
import part2 from './lesson3-part2';

const lesson3 = {
  ...part1,
  example: {
    ...(part1.example || {}),
    ...(part2.example || {})
  },
  exercise: part2.exercise || part1.exercise,
  quiz: part1.quiz || part2.quiz ? {
    ...(part1.quiz || {}),
    ...(part2.quiz || {}),
    questions: [
      ...(part1.quiz?.questions || []),
      ...(part2.quiz?.questions || [])
    ]
  } : null,
  hasExercise: part1.hasExercise || part2.hasExercise,
  hasQuiz: part1.hasQuiz || part2.hasQuiz,
  hasProject: part1.hasProject || part2.hasProject
};

export default lesson3;
