import { useState, type FormEvent } from 'react';
import type { AnnouncementAudience } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '../components/layouts/PageLoader';
import { useAnnouncements, useCreateAnnouncement } from '../hooks/useAnnouncements';
import { gradeLabel } from '../lib/labels';

const AUDIENCES: { id: AnnouncementAudience; label: string }[] = [
  { id: 'ALL', label: 'Everyone' },
  { id: 'PARENTS', label: 'Parents' },
  { id: 'TEACHERS', label: 'Teachers' },
  { id: 'STUDENTS', label: 'Students' },
];

export function AnnouncementsPage() {
  const list = useAnnouncements();
  const create = useCreateAnnouncement();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('PARENTS');
  const [gradeLevel, setGradeLevel] = useState<string>('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        title,
        content,
        audience,
        gradeLevel: gradeLevel === '' ? '' : Number(gradeLevel),
      },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
        },
      }
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Office notices</h1>
        <p className="mt-1 text-sm text-slate-500">
          These appear in the family and teacher portals. They are not blog posts on the public site.
        </p>
      </div>

      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
        <Input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          required
          rows={5}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="Message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="font-medium text-slate-700">Audience</span>
            <select
              className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
              value={audience}
              onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
            >
              {AUDIENCES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Grade (optional)</span>
            <select
              className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              <option value="">All grades</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <option key={g} value={g}>
                  {gradeLabel(g)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Posting…' : 'Post notice'}
        </Button>
        {create.isError ? <p className="text-sm text-red-600">Could not post. Check the title and message.</p> : null}
      </form>

      {list.isLoading ? (
        <PageLoader label="Loading notices" compact />
      ) : (
      <ul className="space-y-3">
        {(list.data ?? []).map((item) => (
          <li key={item._id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {item.audience}
              {item.gradeLevel != null ? ` · ${gradeLabel(item.gradeLevel)}` : ''}
              {item.authorName ? ` · ${item.authorName}` : ''}
            </p>
            <p className="mt-1 font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.content}</p>
            <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
