import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_SITE_CONTENT, type ISiteContent } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSiteContent, useUpdateSiteContent } from '../hooks/useSiteContent';

const FIELDS: { key: keyof ISiteContent; label: string; rows?: number }[] = [
  { key: 'schoolName', label: 'School name' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'addressLine', label: 'Address shown on the site' },
  { key: 'phone', label: 'Phone' },
  { key: 'hours', label: 'Office hours' },
  { key: 'heroTagline', label: 'Hero tagline' },
  { key: 'heroTitle', label: 'Hero title' },
  { key: 'heroBlurb', label: 'Hero paragraph', rows: 4 },
  { key: 'welcomeBody', label: 'Welcome section', rows: 5 },
  { key: 'aboutBody', label: 'About page', rows: 6 },
  { key: 'footerBlurb', label: 'Footer paragraph', rows: 4 },
];

export function WebsiteContentPage() {
  const { data } = useSiteContent();
  const save = useUpdateSiteContent();
  const [form, setForm] = useState<ISiteContent>(DEFAULT_SITE_CONTENT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    save.mutate(form, {
      onSuccess: () => setSaved(true),
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Public website</h1>
      <p className="mt-1 text-sm text-slate-500">
        These fields appear on the public pages. Photos stay as they are until you send new ones.{' '}
        <Link to="/" className="text-teal-800 underline" target="_blank" rel="noreferrer">
          View the site
        </Link>
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {FIELDS.map((field) => (
          <label key={field.key} className="block text-sm">
            <span className="font-medium text-slate-700">{field.label}</span>
            {field.rows ? (
              <textarea
                required
                rows={field.rows}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form[field.key]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              />
            ) : (
              <Input
                required
                className="mt-1.5"
                value={form[field.key]}
                onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              />
            )}
          </label>
        ))}
        {save.isError ? (
          <p className="text-sm text-red-600">Could not save. Check you are signed in as Director or IT Admin.</p>
        ) : null}
        {saved ? <p className="text-sm text-teal-800">Saved. Refresh the public pages to see it.</p> : null}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save website copy'}
        </Button>
      </form>
    </div>
  );
}
