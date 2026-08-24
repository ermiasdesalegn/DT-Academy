/** Local photos of DT Academy students. Git-tracked under apps/web/public/images. */
export const STUDENT = '/images/hero-student.jpg';

export const PHOTOS = {
  classroom: '/images/classroom-writing.png',
  children: '/images/classroom-smiles.png',
  outdoors: '/images/playground.jpg',
  student: '/images/play-together.png',
  parent: '/images/classroom-smiles.png',
  hands: '/images/classroom-hands.png',
  hero: '/images/hero-classroom.jpg',
  arrival: '/images/arrival.png',
};

export const LIBRARY_PHOTOS: { label: string; src: string }[] = [
  { label: 'Hero classroom', src: PHOTOS.hero },
  { label: 'Writing', src: PHOTOS.classroom },
  { label: 'Smiles', src: PHOTOS.children },
  { label: 'Playground', src: PHOTOS.outdoors },
  { label: 'Play together', src: PHOTOS.student },
  { label: 'Hands', src: PHOTOS.hands },
  { label: 'Arrival', src: PHOTOS.arrival },
  { label: 'Student portrait', src: STUDENT },
];
