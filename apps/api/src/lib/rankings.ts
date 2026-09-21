import { prisma } from './prisma';

export async function calculateRankingsForStudent(
  studentId: string,
  academicYear: string,
  gradeLevel: number,
  section: string,
  terms: number[]
) {
  const rankings = [];

  for (const term of terms) {
    // Fetch all APPROVED results for this academic year and term
    const allResults = await prisma.studentResult.findMany({
      where: {
        gradeSheet: {
          academicYear,
          term,
          status: 'APPROVED',
        },
      },
      include: {
        student: {
          select: {
            id: true,
            gradeLevel: true,
            section: true,
          }
        }
      }
    });

    // Aggregate by student
    const studentSums = new Map<string, { totalSum: number; gradeLevel: number; section: string; subjectCount: number }>();

    for (const r of allResults) {
      if (!studentSums.has(r.studentId)) {
        studentSums.set(r.studentId, {
          totalSum: 0,
          gradeLevel: r.student.gradeLevel,
          section: r.student.section,
          subjectCount: 0,
        });
      }
      const s = studentSums.get(r.studentId)!;
      s.totalSum += r.totalScore;
      s.subjectCount += 1;
    }

    const mySumData = studentSums.get(studentId);
    if (!mySumData) continue; // Should not happen if they have approved results

    // Calculate class rank
    const classStudents = Array.from(studentSums.values())
      .filter((s) => s.gradeLevel === gradeLevel && s.section === section)
      .sort((a, b) => b.totalSum - a.totalSum);
    const classRank = classStudents.findIndex((s) => s.totalSum === mySumData.totalSum) + 1;

    // Calculate batch rank
    const batchStudents = Array.from(studentSums.values())
      .filter((s) => s.gradeLevel === gradeLevel)
      .sort((a, b) => b.totalSum - a.totalSum);
    const batchRank = batchStudents.findIndex((s) => s.totalSum === mySumData.totalSum) + 1;

    // Calculate phase rank
    const isPhase1to4 = gradeLevel >= 1 && gradeLevel <= 4;
    const isPhase5to8 = gradeLevel >= 5 && gradeLevel <= 8;
    let phaseTop3 = false;

    if (isPhase1to4) {
      const phaseStudents = Array.from(studentSums.values())
        .filter((s) => s.gradeLevel >= 1 && s.gradeLevel <= 4)
        .sort((a, b) => b.totalSum - a.totalSum);
      const phaseRank = phaseStudents.findIndex((s) => s.totalSum === mySumData.totalSum) + 1;
      if (phaseRank > 0 && phaseRank <= 3) phaseTop3 = true;
    } else if (isPhase5to8) {
      const phaseStudents = Array.from(studentSums.values())
        .filter((s) => s.gradeLevel >= 5 && s.gradeLevel <= 8)
        .sort((a, b) => b.totalSum - a.totalSum);
      const phaseRank = phaseStudents.findIndex((s) => s.totalSum === mySumData.totalSum) + 1;
      if (phaseRank > 0 && phaseRank <= 3) phaseTop3 = true;
    }

    rankings.push({
      term,
      totalSum: mySumData.totalSum,
      average: mySumData.subjectCount > 0 ? mySumData.totalSum / mySumData.subjectCount : 0,
      classRank,
      batchRank,
      phaseTop3,
    });
  }

  return rankings;
}
