export function letterFromTotal(total: number): string {
  if (total >= 90) return 'A';
  if (total >= 80) return 'B';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

export function scoredResult(testScore: number, quizScore: number, finalExamScore: number): {
  testScore: number;
  quizScore: number;
  finalExamScore: number;
  totalScore: number;
  letterGrade: string;
} {
  const test = round1(clampScore(testScore));
  const quiz = round1(clampScore(quizScore));
  const exam = round1(clampScore(finalExamScore));
  const totalScore = round1(test + quiz + exam);
  return { testScore: test, quizScore: quiz, finalExamScore: exam, totalScore, letterGrade: letterFromTotal(totalScore) };
}

function clampScore(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
