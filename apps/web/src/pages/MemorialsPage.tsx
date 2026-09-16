import { useMemo, useState, type FormEvent } from 'react';
import type { MemorialKind, MemorialScope } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MemorialFeed } from '../components/memorials/MemorialFeed';
import { PageLoader } from '../components/layouts/PageLoader';
import {
  useCreateMemorial,
  useDeleteMemorial,
  useMemorials,
  useUploadMemorialMedia,
} from '../hooks/useMemorials';
import { useUsers } from '../hooks/useUsers';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';

const KINDS: { id: MemorialKind; labelKey: string }[] = [
  { id: 'NOTE', labelKey: 'memorials.kindNote' },
  { id: 'BLOG', labelKey: 'memorials.kindBlog' },
  { id: 'PHOTO', labelKey: 'memorials.kindPhoto' },
  { id: 'VIDEO', labelKey: 'memorials.kindVideo' },
];

export function MemorialsPage() {
  const t = useT();
  const list = useMemorials();
  const students = useUsers('students');
  const former = useUsers('former-students');
  const create = useCreateMemorial();
  const upload = useUploadMemorialMedia();
  const remove = useDeleteMemorial();

  const [kind, setKind] = useState<MemorialKind>('NOTE');
  const [scope, setScope] = useState<MemorialScope>('STUDENTS');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [gradeLevel, setGradeLevel] = useState('1');
  const [academicYear, setAcademicYear] = useState('');
  const [section, setSection] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [studentQuery, setStudentQuery] = useState('');

  const people = useMemo(() => {
    const rows = [...(students.data ?? []), ...(former.data ?? [])];
    const seen = new Set<string>();
    return rows.filter((u) => {
      const id = u.studentProfile?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [students.data, former.data]);

  const filteredPeople = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return people.slice(0, 40);
    return people
      .filter((u) => {
        const name = u.name.toLowerCase();
        const id = u.studentProfile?.studentIdNumber.toLowerCase() ?? '';
        return name.includes(q) || id.includes(q);
      })
      .slice(0, 40);
  }, [people, studentQuery]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const url = await upload.mutateAsync(file);
    setMediaUrl(url);
  }

  function toggleStudent(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        kind,
        scope,
        title,
        note,
        mediaUrl: mediaUrl || undefined,
        gradeLevel: scope === 'BATCH' ? Number(gradeLevel) : '',
        academicYear: scope === 'BATCH' ? academicYear : undefined,
        section: scope === 'BATCH' ? section || undefined : undefined,
        studentIds: scope === 'STUDENTS' ? selected : undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setNote('');
          setMediaUrl('');
          setSelected([]);
        },
      }
    );
  }

  const needsMedia = kind === 'PHOTO' || kind === 'VIDEO';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('memorials.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('memorials.hint')}</p>
      </div>

      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="font-medium text-slate-700">{t('memorials.kind')}</span>
            <select
              className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
              value={kind}
              onChange={(e) => setKind(e.target.value as MemorialKind)}
            >
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {t(k.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">{t('memorials.about')}</span>
            <select
              className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
              value={scope}
              onChange={(e) => setScope(e.target.value as MemorialScope)}
            >
              <option value="STUDENTS">{t('memorials.aboutStudents')}</option>
              <option value="BATCH">{t('memorials.aboutBatch')}</option>
            </select>
          </label>
        </div>

        <Input
          required
          placeholder={t('memorials.titlePh')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          required
          rows={5}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder={t('memorials.notePh')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {needsMedia ? (
          <div className="space-y-2 rounded-lg border border-dashed border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">
              {kind === 'PHOTO' ? t('memorials.uploadPhoto') : t('memorials.uploadVideo')}
            </p>
            <input
              type="file"
              accept={kind === 'PHOTO' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm,video/quicktime'}
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            {upload.isPending ? <p className="text-xs text-slate-500">{t('memorials.uploading')}</p> : null}
            {mediaUrl ? (
              <p className="truncate text-xs text-teal-700">{mediaUrl}</p>
            ) : (
              <p className="text-xs text-slate-400">{t('memorials.mediaRequired')}</p>
            )}
            {upload.isError ? <p className="text-sm text-red-600">{t('memorials.uploadError')}</p> : null}
          </div>
        ) : null}

        {scope === 'STUDENTS' ? (
          <div className="space-y-2">
            <Input
              placeholder={t('memorials.searchStudents')}
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200">
              {filteredPeople.length === 0 ? (
                <p className="p-3 text-sm text-slate-500">{t('memorials.noStudents')}</p>
              ) : (
                filteredPeople.map((u) => {
                  const id = u.studentProfile!._id;
                  const checked = selected.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-0 hover:bg-slate-50"
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleStudent(id)} />
                      <span className="min-w-0 flex-1 truncate">
                        {u.name}
                        <span className="text-slate-400">
                          {' '}
                          · {u.studentProfile!.studentIdNumber} · {gradeLabel(u.studentProfile!.gradeLevel)}
                          {u.studentProfile!.section}
                        </span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {selected.length > 0 ? (
              <p className="text-xs text-slate-500">{t('memorials.selectedCount', { n: selected.length })}</p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              <span className="font-medium text-slate-700">{t('memorials.grade')}</span>
              <select
                className="mt-1 block rounded-md border border-slate-200 px-3 py-2"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <option key={g} value={g}>
                    {gradeLabel(g)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">{t('memorials.year')}</span>
              <Input
                className="mt-1"
                required
                placeholder="2025/26"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">{t('memorials.section')}</span>
              <Input
                className="mt-1"
                placeholder="A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </label>
          </div>
        )}

        <Button type="submit" disabled={create.isPending || (needsMedia && !mediaUrl)}>
          {create.isPending ? t('memorials.saving') : t('memorials.publish')}
        </Button>
        {create.isError ? <p className="text-sm text-red-600">{t('memorials.saveError')}</p> : null}
      </form>

      {list.isLoading ? (
        <PageLoader label={t('memorials.loading')} compact />
      ) : list.isError ? (
        <p className="text-sm text-red-600">{t('memorials.loadError')}</p>
      ) : (
        <MemorialFeed
          memorials={list.data ?? []}
          emptyLabel={t('memorials.empty')}
          deletingId={remove.isPending ? remove.variables : null}
          onDelete={(id) => remove.mutate(id)}
        />
      )}
    </div>
  );
}
