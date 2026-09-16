import type { ISchoolMemorial, MemorialKind } from '@dt-academy/types';
import { useFormat } from '../../hooks/useFormat';
import { useT } from '../../hooks/useT';
import { gradeLabel } from '../../lib/labels';

const KIND_KEYS: Record<MemorialKind, string> = {
  NOTE: 'memorials.kindNote',
  BLOG: 'memorials.kindBlog',
  PHOTO: 'memorials.kindPhoto',
  VIDEO: 'memorials.kindVideo',
};

export function MemorialFeed({
  memorials,
  emptyLabel,
  onDelete,
  onEdit,
  deletingId,
}: {
  memorials: ISchoolMemorial[];
  emptyLabel: string;
  onDelete?: (id: string) => void;
  onEdit?: (memorial: ISchoolMemorial) => void;
  deletingId?: string | null;
}) {
  const t = useT();
  const { dateTime } = useFormat();

  if (memorials.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-4">
      {memorials.map((m) => (
        <li key={m._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {m.mediaUrl && m.kind === 'PHOTO' ? (
            <img src={m.mediaUrl} alt="" className="max-h-80 w-full object-cover" />
          ) : null}
          {m.mediaUrl && m.kind === 'VIDEO' ? (
            <video src={m.mediaUrl} controls className="max-h-80 w-full bg-black" />
          ) : null}
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {t(KIND_KEYS[m.kind])}
              {m.scope === 'BATCH' && m.gradeLevel != null
                ? ` · ${gradeLabel(m.gradeLevel)}${m.section ?? ''} · ${m.academicYear ?? ''}`
                : ''}
              {m.scope === 'STUDENTS' && m.students.length
                ? ` · ${m.students.map((s) => s.studentName).join(', ')}`
                : ''}
              {m.authorName ? ` · ${m.authorName}` : ''}
            </p>
            <p className="mt-1 font-semibold text-slate-900">{m.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{m.note}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">{dateTime(m.createdAt)}</p>
              <div className="flex gap-3">
                {onEdit ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-700 hover:underline"
                    onClick={() => onEdit(m)}
                  >
                    {t('memorials.edit')}
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    disabled={deletingId === m._id}
                    onClick={() => onDelete(m._id)}
                  >
                    {deletingId === m._id ? t('memorials.removing') : t('memorials.remove')}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
