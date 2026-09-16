export function subjectsForGrade(grade: number): { name: string; code: string }[] {
  const core = [
    { name: 'Amharic', code: 'AMH' },
    { name: 'English', code: 'ENG' },
    { name: 'Mathematics', code: 'MAT' },
  ];
  if (grade === 0) {
    return [
      ...core,
      { name: 'Environment', code: 'ENV' },
      { name: 'Arts', code: 'ART' },
      { name: 'Physical Education', code: 'PE' },
    ];
  }
  if (grade <= 4) {
    return [
      ...core,
      { name: 'Environmental Science', code: 'ENV' },
      { name: 'Civic Education', code: 'CIV' },
      { name: 'Arts', code: 'ART' },
      { name: 'Physical Education', code: 'PE' },
    ];
  }
  return [
    ...core,
    { name: 'General Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SOC' },
    { name: 'Civic Education', code: 'CIV' },
    { name: 'Information Technology', code: 'ICT' },
    { name: 'Physical Education', code: 'PE' },
  ];
}
