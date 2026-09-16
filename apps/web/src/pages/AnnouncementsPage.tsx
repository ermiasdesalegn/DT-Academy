import { useState, type FormEvent } from 'react';
import type { AnnouncementAudience } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '../components/layouts/PageLoader';
import { useAnnouncements, useCreateAnnouncement } from '../hooks/useAnnouncements';
import { useFormat } from '../hooks/useFormat';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';

const AUDIENCES: AnnouncementAudience[] = ['ALL', 'PARENTS', 'TEACHERS', 'STUDENTS'];

export function AnnouncementsPage() {
  const t = useT();
  const { dateTime } = useFormat();
  const list = useAnnouncements();
  const create = useCreateAnnouncement();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('PARENTS');
  const [gradeLevel, setGradeLevel] = useState<string>('');

  const audienceLabel: Record<AnnouncementAudience, string> = {
    ALL: t('notices.everyone'),
    PARENTS: t('notices.parents'),
    TEACHERS: t('notices.teachers'),
    STUDENTS: t('notices.students'),
  };

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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('notices.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('notices.hint')}</p>
      </div>

      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
        <Input required placeholder={t('notices.titlePh')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          required
          rows={5}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder={t('notices.messagePh')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="font-medium text-slate-700">{t('notices.audience')}</span>
            <select
              className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
              value={audience}
              onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {audienceLabel[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">{t('notices.gradeOptional')}</span>
            <select
              className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              <option value="">{t('notices.allGrades')}</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <option key={g} value={g}>
                  {gradeLabel(g)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? t('notices.posting') : t('notices.post')}
        </Button>
        {create.isError ? <p className="text-sm text-red-600">{t('notices.postError')}</p> : null}
      </form>

      {list.isLoading ? (
        <PageLoader label={t('notices.loading')} compact />
      ) : list.isError ? (
        <p className="text-sm text-red-600">{t('notices.loadError')}</p>
      ) : (
        <ul className="space-y-3">
          {(list.data ?? []).map((item) => (
            <li key={item._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {audienceLabel[item.audience] ?? item.audience}
                {item.gradeLevel != null ? ` · ${gradeLabel(item.gradeLevel)}` : ''}
                {item.authorName ? ` · ${item.authorName}` : ''}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.content}</p>
              <p className="mt-2 text-xs text-slate-400">{dateTime(item.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
