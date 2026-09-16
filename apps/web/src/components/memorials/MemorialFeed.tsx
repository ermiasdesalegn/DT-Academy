import type { ISchoolMemorial, MemorialKind } from '@dt-academy/types';
import { useFormat } from '../../hooks/useFormat';
import { gradeLabel } from '../../lib/labels';

const KIND_LABEL: Record<MemorialKind, string> = {
  NOTE: 'Note',
  BLOG: 'Story',
  PHOTO: 'Photo',
  VIDEO: 'Video',
};

export function MemorialFeed({
  memorials,
  emptyLabel,
  onDelete,
  deletingId,
}: {
  memorials: ISchoolMemorial[];
  emptyLabel: string;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}) {
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
              {KIND_LABEL[m.kind]}
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
              {onDelete ? (
                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  disabled={deletingId === m._id}
                  onClick={() => onDelete(m._id)}
                >
                  {deletingId === m._id ? 'Removing…' : 'Remove'}
                </button>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
