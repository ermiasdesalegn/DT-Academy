export type BlogCategory = 'Notice' | 'School life' | 'Academics' | 'Admissions';

export interface IBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string;
  author: string;
  image: string;
  paragraphs: string[];
}

export const BLOG_CATEGORIES: Array<BlogCategory | 'All'> = [
  'All',
  'Notice',
  'School life',
  'Academics',
  'Admissions',
];

export const BLOG_CATEGORY_VALUES: BlogCategory[] = ['Notice', 'School life', 'Academics', 'Admissions'];

const IMG = {
  arrival: '/images/arrival.png',
  hands: '/images/classroom-hands.png',
  children: '/images/classroom-smiles.png',
};

export const DEFAULT_BLOG_POSTS: IBlogPost[] = [
  {
    slug: 'term-one-opens-in-debre-tabor',
    title: 'Term one opens at the main gate',
    excerpt:
      'Classes for Kindergarten through Grade 8 start on the published calendar. Bring the child to the assigned gate. The office does not take public sign-ups online.',
    category: 'Notice',
    date: '12 August 2026',
    author: 'Front office',
    image: IMG.arrival,
    paragraphs: [
      'DT Academy opens term one in Debre Tabor for Kindergarten through Grade 8. Parents should check the letter sent at admission for the first-day time and the correct gate.',
      'Kindergarten families use the KG gate. Grades 1 to 8 use the main gate. Late arrivals go to the office first. Do not send a child to a classroom without the class list from the teacher.',
      'If you still need a family login, come to the office with the parent phone used at admission. There is no public account form on this website.',
    ],
  },
  {
    slug: 'how-families-read-the-report',
    title: 'How families read the report card',
    excerpt:
      'Teachers submit the class sheet. The Director signs it. Then the parent login shows the marks. Until tuition is verified, the report stays locked.',
    category: 'Academics',
    date: '4 August 2026',
    author: "Director's office",
    image: IMG.hands,
    paragraphs: [
      'Marks begin with the class teacher. A sheet stays in draft until the Director approves it. That is the official record, not a printout from a phone.',
      'Parents of Kindergarten through Grade 4 use the family login only. From Grade 5 the office may turn on a student login. Ask at the desk if you are unsure which account you have.',
      'A pending tuition receipt keeps the report locked. Submit the PNR or bank slip from the family portal, then wait for the office to verify it.',
    ],
  },
  {
    slug: 'pickup-and-the-kg-gate',
    title: 'Pickup rules at the KG gate',
    excerpt:
      'Only named adults on the child’s file may collect a kindergarten pupil. Tell the office in the morning if someone else will come at the last bell.',
    category: 'School life',
    date: '28 July 2026',
    author: 'Kindergarten',
    image: IMG.children,
    paragraphs: [
      'Kindergarten pickup is at the KG gate, not the main road. Staff will not release a child to a person who is not on the file.',
      'If a relative must collect the child, the parent should call the office before noon. A note on paper at the gate is not enough on its own.',
      'After-school care runs only when the office has opened a group that day. Confirm with the class teacher before you leave the child.',
    ],
  },
  {
    slug: 'transport-routes-this-term',
    title: 'Transport routes for this term',
    excerpt:
      'Bus lists are posted at the office. Seats are not booked on the website. Ask at the desk for the stop nearest your home.',
    category: 'Notice',
    date: '21 July 2026',
    author: 'Front office',
    image: IMG.arrival,
    paragraphs: [
      'School transport is arranged by the office each term. The current stops hang on the board inside the main gate.',
      'A family login does not reserve a seat. Come in person or call 011 661 4400 during office hours if you need a change.',
      'Drivers wait a short time at each stop. If you miss the van, bring the child to school yourself that day.',
    ],
  },
  {
    slug: 'what-to-bring-on-admission-day',
    title: 'What to bring on admission day',
    excerpt:
      'Come with the child’s name, grade, a parent phone, and any previous school paper you have. The office creates the login. You do not register on this site.',
    category: 'Admissions',
    date: '9 July 2026',
    author: 'Admissions',
    image: IMG.arrival,
    paragraphs: [
      'Admission is at the office in Debre Tabor. Bring the child if the office asks you to. Email is useful but not required. A working parent phone is required.',
      'The desk will create or reuse the parent account and, for Grade 5 and above, may add a student login. Kindergarten through Grade 4 stay on the parent login.',
      'After admission, tuition is recorded as cash PNR or bank transfer. The student record unlocks when the office verifies the payment.',
    ],
  },
  {
    slug: 'assembly-and-the-school-day',
    title: 'Assembly and the shape of the day',
    excerpt:
      'The bell and assembly set the morning. Class teachers take the roll. Families who need to leave a message should use the office, not the classroom door.',
    category: 'School life',
    date: '2 July 2026',
    author: 'Staff',
    image: IMG.hands,
    paragraphs: [
      'Ordinary days start with assembly. Children should be inside the gate before the first bell. The office can explain the current timetable if you missed the paper sent home.',
      'Visitors sign in at the desk. Do not walk into a classroom during a lesson. A message for a teacher can be left at the office.',
      'Counselling appointments are booked through the office. They are not walk-in public slots.',
    ],
  },
];

export const DEFAULT_BLOG_POSTS_AM: IBlogPost[] = [
  {
    slug: 'term-one-opens-in-debre-tabor',
    title: 'የመጀመሪያ ክፍለ ጊዜ በዋና በር ይከፈታል',
    excerpt:
      'ከኬጂ እስከ 8ኛ ክፍል በተወሰነው ቀን ይጀምራል። ልጁን ወደ የተመደበው በር ይዘው ይምጡ። ቢሮው በድረ-ገጹ የህዝብ ምዝገባ አይቀበልም።',
    category: 'Notice',
    date: '12 August 2026',
    author: 'የፊት ቢሮ',
    image: IMG.arrival,
    paragraphs: [
      'ዲቲ አካዳሚ በደብረ ታቦር ከኬጂ እስከ 8ኛ ክፍል የመጀመሪያ ክፍለ ጊዜን ይከፍታል። ወላጆች በቅበላ የተላከውን ደብዳቤ ለመጀመሪያ ቀን ሰዓት እና በር ይመልከቱ።',
      'የኬጂ ቤተሰቦች የኬጂ በርን ይጠቀማሉ። ከ1ኛ እስከ 8ኛ ዋና በርን ይጠቀማሉ። የዘገዩ መጀመሪያ ወደ ቢሮ ይሂዱ። ያለ መምህሩ ዝርዝር ልጅን ወደ ክፍል አይላኩ።',
      'የቤተሰብ መግቢያ ካስፈለግዎ በቅበላ ጊዜ የተጠቀሙትን የወላጅ ስልክ ይዘው ወደ ቢሮ ይምጡ። በዚህ ድረ-ገጽ የህዝብ መለያ ቅጽ የለም።',
    ],
  },
  {
    slug: 'how-families-read-the-report',
    title: 'ቤተሰቦች ሪፖርት ካርድ እንዴት እንደሚያዩ',
    excerpt:
      'መምህሩ የክፍል ሉህ ያቀርባል። ዳይሬክተሩ ይፈርማል። ከዚያ የወላጅ መግቢያ ውጤቱን ያሳያል። ክፍያ እስኪረጋገጥ ሪፖርቱ ይቆያል።',
    category: 'Academics',
    date: '4 August 2026',
    author: 'የዳይሬክተር ቢሮ',
    image: IMG.hands,
    paragraphs: [
      'ውጤት ከክፍል መምህር ይጀምራል። ሉሁ ዳይሬክተሩ እስኪያጸድቅ በረቂቅ ይቀራል። ኦፊሴላዊው መዝገብ ያ ነው።',
      'ከኬጂ እስከ 4ኛ ክፍል የቤተሰብ መግቢያ ብቻ ነው። ከ5ኛ ጀምሮ ቢሮው የተማሪ መግቢያ ሊከፍት ይችላል።',
      'ያልተረጋገጠ የክፍያ ደረሰኝ ሪፖርቱን ይዘጋል። ከቤተሰብ መግቢያ PNR ወይም የባንክ ወረቀት ያስገቡ፣ ቢሮው እስኪያረጋግጥ ይጠብቁ።',
    ],
  },
];

function isCategory(value: unknown): value is BlogCategory {
  return BLOG_CATEGORY_VALUES.includes(value as BlogCategory);
}

function parsePost(raw: unknown): IBlogPost | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown>;
  const slug = typeof src.slug === 'string' ? src.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') : '';
  const title = typeof src.title === 'string' ? src.title.trim() : '';
  const excerpt = typeof src.excerpt === 'string' ? src.excerpt.trim() : '';
  const date = typeof src.date === 'string' ? src.date.trim() : '';
  const author = typeof src.author === 'string' ? src.author.trim() : '';
  const image = typeof src.image === 'string' ? src.image.trim() : IMG.arrival;
  const paragraphs = Array.isArray(src.paragraphs)
    ? src.paragraphs.filter((p): p is string => typeof p === 'string').map((p) => p.trim()).filter(Boolean)
    : [];
  if (!slug || !title || !excerpt || !date || !author || paragraphs.length === 0) return null;
  if (!isCategory(src.category)) return null;
  if (slug.length > 80 || title.length > 200 || excerpt.length > 800) return null;
  return {
    slug,
    title,
    excerpt,
    category: src.category,
    date,
    author,
    image: image || IMG.arrival,
    paragraphs: paragraphs.slice(0, 12),
  };
}

export function mergeBlogPosts(raw: unknown, fallback: IBlogPost[] = DEFAULT_BLOG_POSTS): IBlogPost[] {
  if (!Array.isArray(raw)) return fallback.map((p) => ({ ...p, paragraphs: [...p.paragraphs] }));
  if (raw.length === 0) return [];
  const seen = new Set<string>();
  const posts: IBlogPost[] = [];
  for (const item of raw) {
    const post = parsePost(item);
    if (!post || seen.has(post.slug)) continue;
    seen.add(post.slug);
    posts.push(post);
  }
  return posts.length > 0 ? posts : fallback.map((p) => ({ ...p, paragraphs: [...p.paragraphs] }));
}

/** Amharic posts by slug; missing slugs fall back to English. */
export function blogForLocale(en: IBlogPost[], am: IBlogPost[]): IBlogPost[] {
  if (am.length === 0) return en;
  const bySlug = new Map(am.map((p) => [p.slug, p]));
  const used = new Set<string>();
  const out: IBlogPost[] = [];
  for (const post of en) {
    const local = bySlug.get(post.slug);
    out.push(local ?? post);
    used.add(post.slug);
  }
  for (const post of am) {
    if (!used.has(post.slug)) out.push(post);
  }
  return out;
}

export function emptyBlogPost(image = IMG.arrival): IBlogPost {
  return {
    slug: `notice-${Date.now().toString(36)}`,
    title: 'New notice',
    excerpt: 'Short summary for the list.',
    category: 'Notice',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    author: 'Front office',
    image,
    paragraphs: ['Write the notice here.'],
  };
}
