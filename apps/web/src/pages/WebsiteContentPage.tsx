import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_BLOG_POSTS, DEFAULT_BLOG_POSTS_AM, DEFAULT_HOME_PAGE_AM, DEFAULT_SITE_CONTENT, emptyBlogPost, mergeBlogPosts, mergeHomePage, mergeSiteCopyAm, type IBlogPost, type IHomePage, type ISiteContent, type ISiteLocaleCopy, BLOG_CATEGORY_VALUES } from '@dt-academy/types';
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSiteContent, useUpdateSiteContent, useUploadSiteImage } from '../hooks/useSiteContent';
import { LIBRARY_PHOTOS } from '../lib/schoolPhotos';

function cloneSite(site: ISiteContent): ISiteContent {
  return JSON.parse(JSON.stringify(site)) as ISiteContent;
}

const LOCALE_COPY_FIELDS: { key: keyof ISiteLocaleCopy; label: string; rows?: number }[] = [
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'addressLine', label: 'Address shown on the site' },
  { key: 'hours', label: 'Office hours' },
  { key: 'heroTagline', label: 'Hero tagline' },
  { key: 'heroTitle', label: 'Hero title' },
  { key: 'heroBlurb', label: 'Hero paragraph', rows: 4 },
  { key: 'welcomeBody', label: 'Welcome section', rows: 5 },
  { key: 'aboutBody', label: 'About page', rows: 6 },
  { key: 'footerBlurb', label: 'Footer paragraph', rows: 4 },
];

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {rows ? (
        <textarea
          required
          rows={rows}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input required className="mt-1.5" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function ImageField({
  label,
  src,
  uploading,
  onFile,
  onPickSrc,
  layout = 'row',
}: {
  label: string;
  src: string;
  uploading: boolean;
  onFile: (file: File) => void;
  onPickSrc: (src: string) => void;
  layout?: 'row' | 'tile';
}) {
  const inputId = useId();
  const inLibrary = LIBRARY_PHOTOS.some((p) => p.src === src);

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  const fileInput = (
    <input
      id={inputId}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      disabled={uploading}
      className="hidden"
      onChange={pick}
    />
  );

  const library = (
    <label className="block text-xs font-medium text-slate-600">
      School photo library
      <select
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={inLibrary ? src : ''}
        onChange={(e) => {
          if (e.target.value) onPickSrc(e.target.value);
        }}
      >
        <option value="">{inLibrary ? 'Library photo selected' : 'Choose a lasting photo'}</option>
        {LIBRARY_PHOTOS.map((p) => (
          <option key={`${p.src}-${p.label}`} value={p.src}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );

  const uploadNote = (
    <p className="text-[11px] leading-snug text-slate-500">
      Uploads on the live free server disappear when it sleeps. Library photos stay in the project.
    </p>
  );

  if (layout === 'tile') {
    return (
      <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[4/3] bg-slate-100">
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {library}
          {fileInput}
          <Button type="button" variant="outline" size="sm" className="w-full" disabled={uploading} onClick={() => document.getElementById(inputId)?.click()}>
            <ImagePlus />
            {uploading ? 'Uploading…' : 'Upload (temporary on live)'}
          </Button>
          {uploadNote}
          <p className="break-all text-[11px] leading-snug text-slate-400" title={src}>
            {src}
          </p>
        </div>
      </article>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80">
      <p className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">{label}</p>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        <img src={src} alt="" className="h-40 w-full rounded-lg object-cover ring-1 ring-slate-200 sm:h-36 sm:w-56 sm:shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          {library}
          {fileInput}
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => document.getElementById(inputId)?.click()}>
            <ImagePlus />
            {uploading ? 'Uploading…' : 'Upload (temporary on live)'}
          </Button>
          {uploadNote}
          <p className="break-all text-xs text-slate-400" title={src}>
            {src}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WebsiteContentPage() {
  const { data } = useSiteContent();
  const save = useUpdateSiteContent();
  const upload = useUploadSiteImage();
  const [form, setForm] = useState<ISiteContent>(DEFAULT_SITE_CONTENT);
  const [savedCopy, setSavedCopy] = useState<ISiteContent>(DEFAULT_SITE_CONTENT);
  const [saved, setSaved] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editLang, setEditLang] = useState<'en' | 'am'>('en');
  const home = form.home;
  const textHome = editLang === 'am' ? form.homeAm : form.home;
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedCopy), [form, savedCopy]);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    if (!data || dirtyRef.current) return;
    const next = cloneSite({
      ...data,
      home: mergeHomePage(data.home),
      copyAm: mergeSiteCopyAm(data.copyAm),
      homeAm: mergeHomePage(data.homeAm, DEFAULT_HOME_PAGE_AM),
      blog: mergeBlogPosts(data.blog, DEFAULT_BLOG_POSTS),
      blogAm: mergeBlogPosts(data.blogAm, DEFAULT_BLOG_POSTS_AM),
    });
    setForm(next);
    setSavedCopy(cloneSite(next));
  }, [data]);

  function setHome(patch: Partial<IHomePage>) {
    setForm((f) => ({ ...f, home: { ...f.home, ...patch } }));
  }

  function setTextHome(patch: Partial<IHomePage>) {
    if (editLang === 'am') {
      setForm((f) => ({ ...f, homeAm: { ...f.homeAm, ...patch } }));
      return;
    }
    setHome(patch);
  }

  function localeCopyValue(key: keyof ISiteLocaleCopy) {
    return editLang === 'am' ? form.copyAm[key] : form[key];
  }

  function setLocaleCopy(key: keyof ISiteLocaleCopy, value: string) {
    if (editLang === 'am') {
      setForm((f) => ({ ...f, copyAm: { ...f.copyAm, [key]: value } }));
      return;
    }
    setForm((f) => ({ ...f, [key]: value }));
  }

  const textBlog = editLang === 'am' ? form.blogAm : form.blog;

  function setTextBlog(next: IBlogPost[]) {
    if (editLang === 'am') {
      setForm((f) => ({ ...f, blogAm: next }));
      return;
    }
    setForm((f) => ({ ...f, blog: next }));
  }

  function patchBlog(index: number, patch: Partial<IBlogPost>) {
    const next = textBlog.map((post, i) => (i === index ? { ...post, ...patch } : post));
    setTextBlog(next);
  }

  function addBlogPost() {
    const post = emptyBlogPost();
    setForm((f) => ({
      ...f,
      blog: [...f.blog, post],
      blogAm: [...f.blogAm, { ...post, title: 'አዲስ ማስታወቂያ', excerpt: 'አጭር ማጠቃለያ።', paragraphs: ['ጽሑፉን እዚህ ይጻፉ።'] }],
    }));
  }

  function removeBlogPost(index: number) {
    const slug = textBlog[index]?.slug;
    if (editLang === 'am') {
      setTextBlog(textBlog.filter((_, i) => i !== index));
      return;
    }
    setForm((f) => ({
      ...f,
      blog: f.blog.filter((_, i) => i !== index),
      blogAm: f.blogAm.filter((p) => p.slug !== slug),
    }));
  }

  function moveBlog(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= textBlog.length) return;
    const next = [...textBlog];
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    setTextBlog(next);
  }

  function undoChanges() {
    setForm(cloneSite(savedCopy));
    setSaved(false);
  }

  async function replaceImage(key: string, apply: (url: string) => void, file: File) {
    setBusyKey(key);
    try {
      apply(await upload.mutateAsync(file));
    } finally {
      setBusyKey(null);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    save.mutate(form, {
      onSuccess: (next) => {
        const merged = cloneSite({
          ...next,
          home: mergeHomePage(next.home),
          copyAm: mergeSiteCopyAm(next.copyAm),
          homeAm: mergeHomePage(next.homeAm, DEFAULT_HOME_PAGE_AM),
          blog: mergeBlogPosts(next.blog, DEFAULT_BLOG_POSTS),
          blogAm: mergeBlogPosts(next.blogAm, DEFAULT_BLOG_POSTS_AM),
        });
        setForm(merged);
        setSavedCopy(cloneSite(merged));
        setSaved(true);
      },
    });
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={save.isPending || Boolean(busyKey) || !dirty}>
        {save.isPending ? 'Saving…' : 'Save website'}
      </Button>
      <Button type="button" variant="outline" disabled={!dirty || save.isPending || Boolean(busyKey)} onClick={undoChanges}>
        <Undo2 />
        Undo
      </Button>
      {dirty ? <p className="text-sm text-slate-500">Unsaved changes</p> : null}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Public website</h1>
      <p className="mt-1 text-sm text-slate-500">
        Change copy, photos, numbers, and blog notices. Edit English and Amharic separately. Photos are shared.
        Prefer a library photo so it stays online. Uploads on the live free server disappear when it sleeps.{' '}
        <Link to="/" className="text-teal-800 underline" target="_blank" rel="noreferrer">
          View the site
        </Link>
      </p>
      <div className="mt-4 inline-flex rounded-full bg-slate-100 p-0.5 text-sm font-semibold">
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${editLang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          onClick={() => setEditLang('en')}
        >
          English copy
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${editLang === 'am' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          onClick={() => setEditLang('am')}
        >
          የአማርኛ ጽሑፍ
        </button>
      </div>
      <div className="mt-5">{actions}</div>

      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <Section title="School identity" hint="Name and phone stay the same in both languages. Address and hours can differ.">
          <Field label="School name" value={form.schoolName} onChange={(v) => setForm((f) => ({ ...f, schoolName: v }))} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          {LOCALE_COPY_FIELDS.slice(0, 4).map((field) => (
            <Field
              key={`${editLang}-${field.key}`}
              label={field.label}
              value={localeCopyValue(field.key)}
              onChange={(v) => setLocaleCopy(field.key, v)}
            />
          ))}
        </Section>

        <Section title="Hero" hint="The first screen on the homepage.">
          {LOCALE_COPY_FIELDS.slice(4, 7).map((field) => (
            <Field
              key={`${editLang}-${field.key}`}
              label={field.label}
              rows={field.rows}
              value={localeCopyValue(field.key)}
              onChange={(v) => setLocaleCopy(field.key, v)}
            />
          ))}
          <Field label="Line under the title" value={textHome.heroLine} onChange={(v) => setTextHome({ heroLine: v })} />
          <Field label="Enquire button" value={textHome.enquireLabel} onChange={(v) => setTextHome({ enquireLabel: v })} />
          <Field label="About button" value={textHome.aboutLabel} onChange={(v) => setTextHome({ aboutLabel: v })} />
          <Field label="Trust line" value={textHome.trustLine} onChange={(v) => setTextHome({ trustLine: v })} />
          <Field label="Face-stack badge" value={textHome.trustBadge} onChange={(v) => setTextHome({ trustBadge: v })} />
          <ImageField
            label="Hero photo"
            src={home.heroImage}
            uploading={busyKey === 'hero'}
            onFile={(file) => replaceImage('hero', (url) => setHome({ heroImage: url }), file)}
            onPickSrc={(url) => setHome({ heroImage: url })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.faceImages.map((src, i) => (
              <ImageField
                key={`face-${i}`}
                layout="tile"
                label={`Face ${i + 1}`}
                src={src}
                uploading={busyKey === `face-${i}`}
                onFile={(file) =>
                  replaceImage(`face-${i}`, (url) => {
                    const faceImages = [...home.faceImages] as IHomePage['faceImages'];
                    faceImages[i] = url;
                    setHome({ faceImages });
                  }, file)
                }
                onPickSrc={(url) => {
                  const faceImages = [...home.faceImages] as IHomePage['faceImages'];
                  faceImages[i] = url;
                  setHome({ faceImages });
                }}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Numbers bar"
          hint="If a value starts with a number (for example 2000+), the homepage counts up. Otherwise it shows the text as written."
        >
          {textHome.stats.map((stat, i) => (
            <div key={`${editLang}-stat-${i}`} className="grid gap-3 sm:grid-cols-2">
              <Field
                label={`Value ${i + 1}`}
                value={stat.value}
                onChange={(v) => {
                  const stats = [...textHome.stats] as IHomePage['stats'];
                  stats[i] = { ...stats[i], value: v };
                  setTextHome({ stats });
                }}
              />
              <Field
                label={`Label ${i + 1}`}
                value={stat.label}
                onChange={(v) => {
                  const stats = [...textHome.stats] as IHomePage['stats'];
                  stats[i] = { ...stats[i], label: v };
                  setTextHome({ stats });
                }}
              />
            </div>
          ))}
        </Section>

        <Section title="Four cards">
          {textHome.cards.map((card, i) => (
            <div key={`${editLang}-card-${i}`} className="space-y-3 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Card {i + 1}</p>
              <Field
                label="Title"
                value={card.title}
                onChange={(v) => {
                  const cards = [...textHome.cards] as IHomePage['cards'];
                  cards[i] = { ...cards[i], title: v };
                  setTextHome({ cards });
                }}
              />
              <Field
                label="Body"
                rows={3}
                value={card.body}
                onChange={(v) => {
                  const cards = [...textHome.cards] as IHomePage['cards'];
                  cards[i] = { ...cards[i], body: v };
                  setTextHome({ cards });
                }}
              />
              <Field
                label="Link text"
                value={card.link}
                onChange={(v) => {
                  const cards = [...textHome.cards] as IHomePage['cards'];
                  cards[i] = { ...cards[i], link: v };
                  setTextHome({ cards });
                }}
              />
              {editLang === 'en' ? (
                <Field
                  label="Link path"
                  value={card.to}
                  onChange={(v) => {
                    const cards = [...home.cards] as IHomePage['cards'];
                    cards[i] = { ...cards[i], to: v };
                    setHome({ cards });
                  }}
                />
              ) : null}
            </div>
          ))}
        </Section>

        <Section title="Contact strip">
          <Field label="Prompt" value={textHome.contactPrompt} onChange={(v) => setTextHome({ contactPrompt: v })} />
          <Field label="Directions button" value={textHome.directionsLabel} onChange={(v) => setTextHome({ directionsLabel: v })} />
          {editLang === 'en' ? (
            <Field label="Maps link" value={home.directionsUrl} onChange={(v) => setHome({ directionsUrl: v })} />
          ) : null}
        </Section>

        <Section title="Welcome">
          <Field label="Eyebrow" value={textHome.welcomeEyebrow} onChange={(v) => setTextHome({ welcomeEyebrow: v })} />
          <Field label="Title before school name" value={textHome.welcomeTitle} onChange={(v) => setTextHome({ welcomeTitle: v })} />
          <Field
            label="Welcome body"
            rows={5}
            value={localeCopyValue('welcomeBody')}
            onChange={(v) => setLocaleCopy('welcomeBody', v)}
          />
          <ImageField
            label="Welcome photo"
            src={home.welcomeImage}
            uploading={busyKey === 'welcome'}
            onFile={(file) => replaceImage('welcome', (url) => setHome({ welcomeImage: url }), file)}
            onPickSrc={(url) => setHome({ welcomeImage: url })}
          />
        </Section>

        <Section title="Programs">
          <Field label="Eyebrow" value={textHome.programEyebrow} onChange={(v) => setTextHome({ programEyebrow: v })} />
          <Field label="Title" value={textHome.programTitle} onChange={(v) => setTextHome({ programTitle: v })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.programImages.map((src, i) => (
              <ImageField
                key={`prog-img-${i}`}
                layout="tile"
                label={`Program photo ${i + 1}`}
                src={src}
                uploading={busyKey === `prog-img-${i}`}
                onFile={(file) =>
                  replaceImage(`prog-img-${i}`, (url) => {
                    const programImages = [...home.programImages] as IHomePage['programImages'];
                    programImages[i] = url;
                    setHome({ programImages });
                  }, file)
                }
                onPickSrc={(url) => {
                  const programImages = [...home.programImages] as IHomePage['programImages'];
                  programImages[i] = url;
                  setHome({ programImages });
                }}
              />
            ))}
          </div>
          {textHome.programs.map((program, i) => (
            <div key={`${editLang}-${program.id}`} className="space-y-3 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stage {i + 1}</p>
              <Field
                label="Tab label"
                value={program.label}
                onChange={(v) => {
                  const programs = [...textHome.programs] as IHomePage['programs'];
                  programs[i] = { ...programs[i], label: v };
                  setTextHome({ programs });
                }}
              />
              <Field
                label="Title"
                value={program.title}
                onChange={(v) => {
                  const programs = [...textHome.programs] as IHomePage['programs'];
                  programs[i] = { ...programs[i], title: v };
                  setTextHome({ programs });
                }}
              />
              <Field
                label="Body"
                rows={4}
                value={program.body}
                onChange={(v) => {
                  const programs = [...textHome.programs] as IHomePage['programs'];
                  programs[i] = { ...programs[i], body: v };
                  setTextHome({ programs });
                }}
              />
            </div>
          ))}
        </Section>

        <Section title="Why families stay">
          <Field label="Eyebrow" value={textHome.whyEyebrow} onChange={(v) => setTextHome({ whyEyebrow: v })} />
          {textHome.why.map((item, i) => (
            <div key={`${editLang}-why-${i}`} className="grid gap-3">
              <Field
                label={`Heading ${i + 1}`}
                value={item.title}
                onChange={(v) => {
                  const why = [...textHome.why] as IHomePage['why'];
                  why[i] = { ...why[i], title: v };
                  setTextHome({ why });
                }}
              />
              <Field
                label={`Body ${i + 1}`}
                rows={3}
                value={item.body}
                onChange={(v) => {
                  const why = [...textHome.why] as IHomePage['why'];
                  why[i] = { ...why[i], body: v };
                  setTextHome({ why });
                }}
              />
            </div>
          ))}
          <ImageField
            label="Illustration"
            src={home.growImage}
            uploading={busyKey === 'grow'}
            onFile={(file) => replaceImage('grow', (url) => setHome({ growImage: url }), file)}
            onPickSrc={(url) => setHome({ growImage: url })}
          />
        </Section>

        <Section title="Quotes">
          <Field label="Eyebrow" value={textHome.quotesEyebrow} onChange={(v) => setTextHome({ quotesEyebrow: v })} />
          <Field label="Title" value={textHome.quotesTitle} onChange={(v) => setTextHome({ quotesTitle: v })} />
          <ImageField
            label="Quote photo"
            src={home.quoteImage}
            uploading={busyKey === 'quote'}
            onFile={(file) => replaceImage('quote', (url) => setHome({ quoteImage: url }), file)}
            onPickSrc={(url) => setHome({ quoteImage: url })}
          />
          {textHome.quotes.map((quote, i) => (
            <div key={`${editLang}-quote-${i}`} className="space-y-3 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quote {i + 1}</p>
              <Field
                label="Name"
                value={quote.name}
                onChange={(v) => {
                  const quotes = [...textHome.quotes] as IHomePage['quotes'];
                  quotes[i] = { ...quotes[i], name: v };
                  setTextHome({ quotes });
                }}
              />
              <Field
                label="Role"
                value={quote.role}
                onChange={(v) => {
                  const quotes = [...textHome.quotes] as IHomePage['quotes'];
                  quotes[i] = { ...quotes[i], role: v };
                  setTextHome({ quotes });
                }}
              />
              <Field
                label="Quote"
                rows={4}
                value={quote.text}
                onChange={(v) => {
                  const quotes = [...textHome.quotes] as IHomePage['quotes'];
                  quotes[i] = { ...quotes[i], text: v };
                  setTextHome({ quotes });
                }}
              />
            </div>
          ))}
        </Section>

        <Section title="Closing banner">
          <Field label="Eyebrow" value={textHome.ctaEyebrow} onChange={(v) => setTextHome({ ctaEyebrow: v })} />
          <Field label="Title" value={textHome.ctaTitle} onChange={(v) => setTextHome({ ctaTitle: v })} />
          <Field label="Button" value={textHome.ctaButton} onChange={(v) => setTextHome({ ctaButton: v })} />
          <Field label="Note under the button" value={textHome.ctaNote} onChange={(v) => setTextHome({ ctaNote: v })} />
          <p className="text-sm font-medium text-slate-700">Banner photos</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.yearbookImages.map((src, i) => (
              <ImageField
                key={`yb-${i}`}
                layout="tile"
                label={`Tile ${i + 1}`}
                src={src}
                uploading={busyKey === `yb-${i}`}
                onFile={(file) =>
                  replaceImage(`yb-${i}`, (url) => {
                    const yearbookImages = [...home.yearbookImages] as IHomePage['yearbookImages'];
                    yearbookImages[i] = url;
                    setHome({ yearbookImages });
                  }, file)
                }
                onPickSrc={(url) => {
                  const yearbookImages = [...home.yearbookImages] as IHomePage['yearbookImages'];
                  yearbookImages[i] = url;
                  setHome({ yearbookImages });
                }}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Blog / notices"
          hint={
            editLang === 'am'
              ? 'Amharic text for the same slugs. Missing slugs fall back to English on the public site.'
              : 'These posts appear on /blog. Slug is the URL. Save after you add or remove a notice.'
          }
        >
          <Button type="button" variant="outline" size="sm" onClick={addBlogPost}>
            <Plus />
            Add notice
          </Button>
          {textBlog.map((post, i) => (
            <div key={`${editLang}-${post.slug}-${i}`} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notice {i + 1}</p>
                <Button type="button" size="sm" variant="ghost" disabled={i === 0} onClick={() => moveBlog(i, -1)}>
                  <ChevronUp />
                </Button>
                <Button type="button" size="sm" variant="ghost" disabled={i === textBlog.length - 1} onClick={() => moveBlog(i, 1)}>
                  <ChevronDown />
                </Button>
                <Button type="button" size="sm" variant="outline" className="ml-auto text-red-700" onClick={() => removeBlogPost(i)}>
                  <Trash2 />
                  Remove
                </Button>
              </div>
              <Field label="URL slug" value={post.slug} onChange={(v) => patchBlog(i, { slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
              <Field label="Title" value={post.title} onChange={(v) => patchBlog(i, { title: v })} />
              <Field label="Excerpt" rows={2} value={post.excerpt} onChange={(v) => patchBlog(i, { excerpt: v })} />
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Category</span>
                <select
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={post.category}
                  onChange={(e) => patchBlog(i, { category: e.target.value as IBlogPost['category'] })}
                >
                  {BLOG_CATEGORY_VALUES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Date" value={post.date} onChange={(v) => patchBlog(i, { date: v })} />
              <Field label="Author" value={post.author} onChange={(v) => patchBlog(i, { author: v })} />
              <Field
                label="Paragraphs (blank line between)"
                rows={8}
                value={post.paragraphs.join('\n\n')}
                onChange={(v) =>
                  patchBlog(i, {
                    paragraphs: v
                      .split(/\n\s*\n/)
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                }
              />
              <ImageField
                label="Notice photo"
                src={post.image}
                uploading={busyKey === `blog-${editLang}-${i}`}
                onFile={(file) =>
                  replaceImage(`blog-${editLang}-${i}`, (url) => patchBlog(i, { image: url }), file)
                }
                onPickSrc={(url) => patchBlog(i, { image: url })}
              />
            </div>
          ))}
        </Section>

        <Section title="About & footer" hint="About page body and the footer paragraph on every public page.">
          {LOCALE_COPY_FIELDS.slice(8).map((field) => (
            <Field
              key={`${editLang}-${field.key}`}
              label={field.label}
              rows={field.rows}
              value={localeCopyValue(field.key)}
              onChange={(v) => setLocaleCopy(field.key, v)}
            />
          ))}
        </Section>

        {save.isError ? (
          <p className="text-sm text-red-600">Could not save. Sign in as Director or IT Admin.</p>
        ) : null}
        {upload.isError ? (
          <p className="text-sm text-red-600">Photo did not upload. Use JPEG, PNG, or WebP under 8 MB, then save.</p>
        ) : null}
        {saved ? <p className="text-sm text-teal-800">Saved. Open the public site to see the change.</p> : null}
        {actions}
      </form>
    </div>
  );
}
