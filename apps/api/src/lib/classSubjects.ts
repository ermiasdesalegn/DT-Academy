export function expectedSubjects(gradeLevel: number): string[] {
  if (gradeLevel <= 0) {
    return ['Play and language', 'Numbers', 'Outdoor time'];
  }
  if (gradeLevel <= 4) {
    return ['Amharic', 'English', 'Mathematics', 'Environmental science', 'Art', 'Physical education'];
  }
  return ['Amharic', 'English', 'Mathematics', 'Science', 'Social studies', 'Civics', 'Physical education'];
}
