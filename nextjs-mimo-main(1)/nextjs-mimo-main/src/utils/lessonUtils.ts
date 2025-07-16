export function formatPrerequisite(prereq: string, lessonTitles: { [key: string]: string }): string {
  // Vérifier si le prérequis est un ID valide
  if (prereq in lessonTitles) {
    return lessonTitles[prereq];
  }
  // Si ce n'est pas un ID valide, retourner le prérequis tel quel
  return prereq;
}
