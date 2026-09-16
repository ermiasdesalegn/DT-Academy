/** Shared KG–G8 subject list. Same catalog for every class; office assigns teachers per class or applies one template to all. */
export function subjectsForGrade(_grade?: number): { name: string; code: string }[] {
  return [
    { name: 'Amharic', code: 'AMH' },
    { name: 'English', code: 'ENG' },
    { name: 'Mathematics', code: 'MAT' },
    { name: 'Environmental Science', code: 'ENV' },
    { name: 'General Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SOC' },
    { name: 'Civic Education', code: 'CIV' },
    { name: 'Information Technology', code: 'ICT' },
    { name: 'Arts', code: 'ART' },
    { name: 'Physical Education', code: 'PE' },
  ];
}
