import { useState } from 'react';
import { usePosts, useCreatePost, useDeletePost } from '../hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageLoader } from '../components/layouts/PageLoader';
import { EmptyState } from '../components/layouts/Page';
import { api } from '../services/api';
import type { PostKind, IPost } from '@dt-academy/types';
import { useUsers } from '../hooks/useUsers';

export function AdminPostsPage() {
  const { data: posts, isLoading } = usePosts('MEMORY_CHALLENGE');
  const [open, setOpen] = useState(false);
  const deletePost = useDeletePost();

  if (isLoading) return <PageLoader label="Loading memory challenges" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Memory Challenges</h1>
          <p className="mt-1 text-sm text-slate-500">Post past photos of former students to challenge the community.</p>
        </div>
        <Button onClick={() => setOpen(true)}>New Challenge</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No challenges" body="Create a memory challenge to engage the community." />
          </div>
        ) : (
          posts?.map((post) => (
            <div key={post._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100 mb-4">
                <img src={post.pastPhotoUrl} alt="Past" className="h-full w-full object-cover" />
              </div>
              <h3 className="font-medium text-slate-900">{post.questionText}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Answer: <span className="font-medium text-slate-900">{post.correctAnswer}</span>
              </p>
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => confirm('Delete this challenge?') && deletePost.mutate(post._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateChallengeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CreateChallengeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createPost = useCreatePost();
  const { data: usersData } = useUsers({ group: 'former-students' });
  const students = usersData?.users || [];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  
  const [studentId, setStudentId] = useState('');
  const [pastPhotoFile, setPastPhotoFile] = useState<File | null>(null);
  const [currentPhotoFile, setCurrentPhotoFile] = useState<File | null>(null);
  const [questionText, setQuestionText] = useState('Who is this?');
  const [questionType, setQuestionType] = useState<'TEXT' | 'MULTIPLE_CHOICE'>('TEXT');
  const [optionsStr, setOptionsStr] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ url: string }>('/memorials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pastPhotoFile) {
      setError('Past photo is required');
      return;
    }
    setError('');
    setBusy(true);

    try {
      const pastPhotoUrl = await uploadFile(pastPhotoFile);
      const currentPhotoUrl = currentPhotoFile ? await uploadFile(currentPhotoFile) : undefined;
      
      const options = questionType === 'MULTIPLE_CHOICE' ? optionsStr.split(',').map(s => s.trim()) : undefined;

      await createPost.mutateAsync({
        kind: 'MEMORY_CHALLENGE',
        studentId: studentId || undefined,
        pastPhotoUrl,
        currentPhotoUrl,
        questionText,
        questionType,
        options,
        correctAnswer,
      });

      onOpenChange(false);
      setStudentId('');
      setPastPhotoFile(null);
      setCurrentPhotoFile(null);
      setQuestionText('Who is this?');
      setOptionsStr('');
      setCorrectAnswer('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create challenge');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Memory Challenge</DialogTitle>
          <DialogDescription>Post a past photo of a former student.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="text-sm">
            <span className="font-medium text-slate-700">Link to Former Student (Optional)</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- No linked student --</option>
              {students.map(s => (
                <option key={s._id} value={s.studentProfile?._id || ''}>{s.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-slate-700">Past Photo (Required)</span>
            <Input type="file" accept="image/*" className="mt-1.5" onChange={(e) => setPastPhotoFile(e.target.files?.[0] || null)} />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Current Photo (Optional)</span>
            <Input type="file" accept="image/*" className="mt-1.5" onChange={(e) => setCurrentPhotoFile(e.target.files?.[0] || null)} />
          </label>
          
          <label className="text-sm">
            <span className="font-medium text-slate-700">Question</span>
            <Input className="mt-1.5" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="font-medium text-slate-700">Type</span>
              <select
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
              >
                <option value="TEXT">Text Guess</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">Correct Answer</span>
              <Input className="mt-1.5" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required />
            </label>
          </div>

          {questionType === 'MULTIPLE_CHOICE' && (
            <label className="text-sm">
              <span className="font-medium text-slate-700">Options (Comma separated)</span>
              <Input className="mt-1.5" placeholder="John Doe, Jane Doe, Jack Doe" value={optionsStr} onChange={(e) => setOptionsStr(e.target.value)} required />
            </label>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Post Challenge'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
