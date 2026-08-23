export interface IHomeStat {
  value: string;
  label: string;
}

export interface IHomeCard {
  title: string;
  body: string;
  link: string;
  to: string;
}

export interface IHomeProgram {
  id: string;
  label: string;
  title: string;
  body: string;
}

export interface IHomeWhy {
  title: string;
  body: string;
}

export interface IHomeQuote {
  name: string;
  role: string;
  text: string;
}

export interface IHomePage {
  heroImage: string;
  welcomeImage: string;
  growImage: string;
  programImages: [string, string, string];
  faceImages: [string, string, string];
  yearbookImages: [string, string, string, string, string];
  quoteImage: string;
  heroLine: string;
  enquireLabel: string;
  aboutLabel: string;
  trustLine: string;
  trustBadge: string;
  stats: [IHomeStat, IHomeStat, IHomeStat, IHomeStat];
  cards: [IHomeCard, IHomeCard, IHomeCard, IHomeCard];
  welcomeEyebrow: string;
  welcomeTitle: string;
  programEyebrow: string;
  programTitle: string;
  programs: [IHomeProgram, IHomeProgram, IHomeProgram];
  whyEyebrow: string;
  why: [IHomeWhy, IHomeWhy, IHomeWhy];
  quotesEyebrow: string;
  quotesTitle: string;
  quotes: [IHomeQuote, IHomeQuote];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaButton: string;
  ctaNote: string;
  contactPrompt: string;
  directionsLabel: string;
  directionsUrl: string;
}

export const DEFAULT_HOME_PAGE: IHomePage = {
  heroImage: '/images/hero-classroom.jpg',
  welcomeImage: '/images/classroom-writing.png',
  growImage: '/images/grow.png',
  programImages: ['/images/classroom-writing.png', '/images/classroom-smiles.png', '/images/playground.jpg'],
  faceImages: ['/images/hero-student.jpg', '/images/play-together.png', '/images/playground.jpg'],
  yearbookImages: [
    '/images/hero-student.jpg',
    '/images/classroom-smiles.png',
    '/images/playground.jpg',
    '/images/play-together.png',
    '/images/arrival.png',
  ],
  quoteImage: '/images/classroom-smiles.png',
  heroLine: 'Kindergarten to Grade 8',
  enquireLabel: 'Enquire now',
  aboutLabel: 'About us',
  trustLine: 'Trusted by parents from Debre Tabor.',
  trustBadge: '+2K',
  stats: [
    { value: '2,000+', label: 'Happy students' },
    { value: '60+', label: 'Qualified teachers' },
    { value: 'KG – Grade 8', label: 'Quality education' },
    { value: 'Debre Tabor', label: 'Ethiopia' },
  ],
  cards: [
    {
      title: 'Our school',
      body: 'A closed K–8 campus in Debre Tabor. The office admits every child.',
      link: 'Learn more',
      to: '/about',
    },
    {
      title: 'Our programs',
      body: 'Kindergarten through Grade 8, with class teachers and a Director-signed report.',
      link: 'View programs',
      to: '/academics',
    },
    {
      title: 'Enroll your child',
      body: 'Come to the office with the family. There is no public sign-up form.',
      link: 'How to apply',
      to: '/admissions',
    },
    {
      title: 'Contact us',
      body: 'Gate hours, pickup, and tuition questions are handled at the front office.',
      link: 'Get in touch',
      to: '/contact',
    },
  ],
  welcomeEyebrow: 'Our story',
  welcomeTitle: 'Welcome to',
  programEyebrow: 'Our program',
  programTitle: 'Journey of education at DT',
  programs: [
    {
      id: 'kg',
      label: 'Kindergarten',
      title: 'Kindergarten',
      body: 'Play, language, and first classroom habits. Pickup is at the KG gate. Families use the parent portal. There is no student login at this age.',
    },
    {
      id: 'primary',
      label: 'Elementary',
      title: 'Grades 1–8',
      body: 'Literacy, numeracy, and subjects with class teachers. Grades 1–4 stay on the family login. The office admits every child; the Director signs official grades.',
    },
    {
      id: 'prep',
      label: 'Prep',
      title: 'Prep',
      body: 'Exam years and subject teachers. From Grade 5 the office may enable a student login. Report cards stay locked until tuition is verified.',
    },
  ],
  whyEyebrow: 'Why families stay',
  why: [
    {
      title: 'One school, every year',
      body: 'Kindergarten through Grade 8 on one roll, with the same office and the same standard.',
    },
    {
      title: 'Teachers own the gradebook',
      body: 'Marks stay in draft until the Director approves a class sheet.',
    },
    {
      title: 'Families, not a marketplace',
      body: 'Parent logins are issued at admission. KG to Grade 4 use the family portal only.',
    },
  ],
  quotesEyebrow: 'From our parents',
  quotesTitle: 'What families tell us',
  quotes: [
    {
      name: 'Ms. Helen Tesfaye',
      role: 'Parent',
      text: 'The office is clear about admission and pickup. Our daughter is in KG and we only use the family login. That is how it should be.',
    },
    {
      name: 'Mr. Abebe Kebede',
      role: 'Parent',
      text: 'Teachers submit the class sheet; the Director approves it. We see school life without a public marketplace of accounts.',
    },
  ],
  ctaEyebrow: 'Work together',
  ctaTitle: "Let's secure your child's future",
  ctaButton: 'Join now',
  ctaNote: 'Join now opens admissions. The office still creates every account.',
  contactPrompt: 'Have questions?',
  directionsLabel: 'Get directions',
  directionsUrl: 'https://maps.app.goo.gl/zMk6Dw8TxbPGeQh98',
};

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function arr<T>(v: unknown, fallback: T[], map: (item: unknown, i: number, fb: T) => T): T[] {
  if (!Array.isArray(v) || v.length === 0) return fallback;
  return fallback.map((fb, i) => map(v[i], i, fb));
}

export const DEFAULT_HOME_PAGE_AM: IHomePage = {
  ...DEFAULT_HOME_PAGE,
  heroLine: 'ከኬጂ እስከ 8ኛ ክፍል',
  enquireLabel: 'አሁን ይጠይቁ',
  aboutLabel: 'ስለ እኛ',
  trustLine: 'በደብረ ታቦር ወላጆች የታመነ።',
  trustBadge: '+2ሺ',
  stats: [
    { value: '2,000+', label: 'ደስተኛ ተማሪዎች' },
    { value: '60+', label: 'ብቁ መምህራን' },
    { value: 'ኬጂ – 8ኛ ክፍል', label: 'ጥራት ያለው ትምህርት' },
    { value: 'ደብረ ታቦር', label: 'ኢትዮጵያ' },
  ],
  cards: [
    {
      title: 'ትምህርት ቤታችን',
      body: 'በደብረ ታቦር የተዘጋ ከኬጂ እስከ 8ኛ ክፍል ግቢ። ቢሮው እያንዳንዱን ልጅ ይቀበላል።',
      link: 'ተጨማሪ ይወቁ',
      to: '/about',
    },
    {
      title: 'ፕሮግራሞቻችን',
      body: 'ከኬጂ እስከ 8ኛ ክፍል፣ የክፍል መምህራን እና በዳይሬክተር የተፈረመ ሪፖርት።',
      link: 'ፕሮግራሞችን ይመልከቱ',
      to: '/academics',
    },
    {
      title: 'ልጅዎን ይመዝግቡ',
      body: 'ከቤተሰብ ጋር ወደ ቢሮ ይምጡ። የህዝብ የምዝገባ ቅጽ የለም።',
      link: 'እንዴት መመዝገብ',
      to: '/admissions',
    },
    {
      title: 'ያግኙን',
      body: 'የበር ሰዓት፣ መውሰጃ እና ክፍያ ጥያቄዎች በፊት ቢሮ ይስተናገዳሉ።',
      link: 'ያግኙን',
      to: '/contact',
    },
  ],
  welcomeEyebrow: 'ታሪካችን',
  welcomeTitle: 'እንኳን ደህና መጡ ወደ',
  programEyebrow: 'ፕሮግራማችን',
  programTitle: 'በዲቲ የትምህርት ጉዞ',
  programs: [
    {
      id: 'kg',
      label: 'ኪንደርጋርተን',
      title: 'ኪንደርጋርተን',
      body: 'ጨዋታ፣ ቋንቋ እና የመጀመሪያ የክፍል ልምዶች። መውሰጃ በኬጂ በር ነው። ቤተሰቦች የወላጅ መግቢያን ይጠቀማሉ። በዚህ ዕድሜ የተማሪ መግቢያ የለም።',
    },
    {
      id: 'primary',
      label: 'አንደኛ ደረጃ',
      title: '1–8ኛ ክፍል',
      body: 'ንባብ፣ ሂሳብ እና ትምህርቶች ከክፍል መምህራን ጋር። 1–4ኛ በቤተሰብ መግቢያ ይቀራሉ። ቢሮው እያንዳንዱን ልጅ ይቀበላል፤ ዳይሬክተሩ ኦፊሴላዊ ውጤቶችን ይፈርማል።',
    },
    {
      id: 'prep',
      label: 'ፕሬፕ',
      title: 'ፕሬፕ',
      body: 'የፈተና ዓመታት እና የትምህርት መምህራን። ከ5ኛ ክፍል ጀምሮ ቢሮው የተማሪ መግቢያ ሊከፍት ይችላል። ክፍያ እስኪረጋገጥ ድረስ ሪፖርት ካርድ ይቆያል።',
    },
  ],
  whyEyebrow: 'ቤተሰቦች ለምን እንደሚቆዩ',
  why: [
    {
      title: 'አንድ ትምህርት ቤት፣ በየዓመቱ',
      body: 'ከኬጂ እስከ 8ኛ ክፍል በአንድ መዝገብ፣ ተመሳሳይ ቢሮ እና ተመሳሳይ መስፈርት።',
    },
    {
      title: 'መምህራን የውጤት መዝገቡን ይይዛሉ',
      body: 'ውጤቶች ዳይሬክተሩ የክፍል ሉህ እስኪያጸድቅ ድረስ ረቂቅ ሆነው ይቀራሉ።',
    },
    {
      title: 'ቤተሰቦች፣ የገበያ ቦታ አይደለም',
      body: 'የወላጅ መግቢያዎች በቅበላ ጊዜ ይሰጣሉ። ከኬጂ እስከ 4ኛ ክፍል የቤተሰብ መግቢያን ብቻ ይጠቀማሉ።',
    },
  ],
  quotesEyebrow: 'ከወላጆቻችን',
  quotesTitle: 'ቤተሰቦች የሚሉን',
  quotes: [
    {
      name: 'ወ/ሮ ሄለን ተስፋዬ',
      role: 'ወላጅ',
      text: 'ቢሮው ስለ ቅበላ እና መውሰጃ ግልጽ ነው። ሴት ልጃችን በኬጂ ናት እና የቤተሰብ መግቢያን ብቻ እንጠቀማለን። እንዲሁ መሆን አለበት።',
    },
    {
      name: 'አቶ አበበ ከበደ',
      role: 'ወላጅ',
      text: 'መምህራን የክፍል ሉህ ያቀርባሉ፤ ዳይሬክተሩ ያጸድቃል። የትምህርት ቤት ሕይወትን ያለ የህዝብ የመለያ ገበያ እንመለከታለን።',
    },
  ],
  ctaEyebrow: 'አብረን እንስራ',
  ctaTitle: 'የልጅዎን የወደፊት እናረጋግጥ',
  ctaButton: 'አሁን ይቀላቀሉ',
  ctaNote: 'አሁን ይቀላቀሉ ወደ ቅበላ ይከፍታል። መለያውን የሚፈጥረው አሁንም ቢሮው ነው።',
  contactPrompt: 'ጥያቄ አለዎት?',
  directionsLabel: 'አቅጣጫ ያግኙ',
};

export function mergeHomePage(raw: unknown, defaults: IHomePage = DEFAULT_HOME_PAGE): IHomePage {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const d = defaults;
  return {
    heroImage: str(src.heroImage, d.heroImage),
    welcomeImage: str(src.welcomeImage, d.welcomeImage),
    growImage: str(src.growImage, d.growImage),
    programImages: arr(src.programImages, [...d.programImages], (item, _i, fb) => str(item, fb)) as IHomePage['programImages'],
    faceImages: arr(src.faceImages, [...d.faceImages], (item, _i, fb) => str(item, fb)) as IHomePage['faceImages'],
    yearbookImages: arr(src.yearbookImages, [...d.yearbookImages], (item, _i, fb) => str(item, fb)) as IHomePage['yearbookImages'],
    quoteImage: str(src.quoteImage, d.quoteImage),
    heroLine: str(src.heroLine, d.heroLine),
    enquireLabel: str(src.enquireLabel, d.enquireLabel),
    aboutLabel: str(src.aboutLabel, d.aboutLabel),
    trustLine: str(src.trustLine, d.trustLine),
    trustBadge: str(src.trustBadge, d.trustBadge),
    stats: arr(src.stats, [...d.stats], (item, _i, fb) => {
      const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return { value: str(o.value, fb.value), label: str(o.label, fb.label) };
    }) as IHomePage['stats'],
    cards: arr(src.cards, [...d.cards], (item, _i, fb) => {
      const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        title: str(o.title, fb.title),
        body: str(o.body, fb.body),
        link: str(o.link, fb.link),
        to: str(o.to, fb.to),
      };
    }) as IHomePage['cards'],
    welcomeEyebrow: str(src.welcomeEyebrow, d.welcomeEyebrow),
    welcomeTitle: str(src.welcomeTitle, d.welcomeTitle),
    programEyebrow: str(src.programEyebrow, d.programEyebrow),
    programTitle: str(src.programTitle, d.programTitle),
    programs: arr(src.programs, [...d.programs], (item, _i, fb) => {
      const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        id: str(o.id, fb.id),
        label: str(o.label, fb.label),
        title: str(o.title, fb.title),
        body: str(o.body, fb.body),
      };
    }) as IHomePage['programs'],
    whyEyebrow: str(src.whyEyebrow, d.whyEyebrow),
    why: arr(src.why, [...d.why], (item, _i, fb) => {
      const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return { title: str(o.title, fb.title), body: str(o.body, fb.body) };
    }) as IHomePage['why'],
    quotesEyebrow: str(src.quotesEyebrow, d.quotesEyebrow),
    quotesTitle: str(src.quotesTitle, d.quotesTitle),
    quotes: arr(src.quotes, [...d.quotes], (item, _i, fb) => {
      const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return { name: str(o.name, fb.name), role: str(o.role, fb.role), text: str(o.text, fb.text) };
    }) as IHomePage['quotes'],
    ctaEyebrow: str(src.ctaEyebrow, d.ctaEyebrow),
    ctaTitle: str(src.ctaTitle, d.ctaTitle),
    ctaButton: str(src.ctaButton, d.ctaButton),
    ctaNote: str(src.ctaNote, d.ctaNote),
    contactPrompt: str(src.contactPrompt, d.contactPrompt),
    directionsLabel: str(src.directionsLabel, d.directionsLabel),
    directionsUrl: str(src.directionsUrl, d.directionsUrl),
  };
}

export function homeWithSharedAssets(text: IHomePage, assets: IHomePage): IHomePage {
  return {
    ...text,
    heroImage: assets.heroImage,
    welcomeImage: assets.welcomeImage,
    growImage: assets.growImage,
    programImages: assets.programImages,
    faceImages: assets.faceImages,
    yearbookImages: assets.yearbookImages,
    quoteImage: assets.quoteImage,
    directionsUrl: assets.directionsUrl,
    cards: text.cards.map((card, i) => ({ ...card, to: assets.cards[i]?.to ?? card.to })) as IHomePage['cards'],
    programs: text.programs.map((program, i) => ({
      ...program,
      id: assets.programs[i]?.id ?? program.id,
    })) as IHomePage['programs'],
  };
}

export function parseStatCount(value: string): { n: number; suffix: string } | null {
  const m = value.replace(/,/g, '').match(/^(\d+)(.*)$/);
  if (!m) return null;
  return { n: Number(m[1]), suffix: m[2] ?? '' };
}
