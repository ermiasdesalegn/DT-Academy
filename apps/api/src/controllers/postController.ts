import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import type { IPost, ICreatePostRequest } from '@dt-academy/types';

function mapPost(row: any): IPost {
  return {
    _id: row.id,
    kind: row.kind,
    authorId: row.authorId,
    authorName: row.author.name,
    title: row.title ?? undefined,
    content: row.content ?? undefined,
    mediaUrls: row.mediaUrls,
    studentId: row.studentId ?? undefined,
    studentName: row.student?.user.name ?? undefined,
    pastPhotoUrl: row.pastPhotoUrl ?? undefined,
    currentPhotoUrl: row.currentPhotoUrl ?? undefined,
    questionText: row.questionText ?? undefined,
    questionType: row.questionType ?? undefined,
    options: row.options ? (row.options as string[]) : undefined,
    correctAnswer: row.correctAnswer ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPosts(req: Request, res: Response): Promise<void> {
  const kind = typeof req.query.kind === 'string' ? req.query.kind : undefined;
  
  const where: any = {};
  if (kind) {
    where.kind = kind;
  }

  const rows = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
      student: { select: { user: { select: { name: true } } } },
    },
    take: 50,
  });

  res.json(rows.map(mapPost));
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const row = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { name: true } },
      student: { select: { user: { select: { name: true } } } },
    },
  });

  if (!row) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  res.json(mapPost(row));
}

export async function createPost(req: Request, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'DIRECTOR' && req.user.role !== 'IT_ADMIN' && req.user.role !== 'MANAGER')) {
    res.status(403).json({ message: 'Only admins can create posts' });
    return;
  }

  const body = req.body as ICreatePostRequest;
  
  const row = await prisma.post.create({
    data: {
      kind: body.kind,
      authorId: req.user.id,
      title: body.title,
      content: body.content,
      mediaUrls: body.mediaUrls ?? [],
      studentId: body.studentId,
      pastPhotoUrl: body.pastPhotoUrl,
      currentPhotoUrl: body.currentPhotoUrl,
      questionText: body.questionText,
      questionType: body.questionType,
      options: body.options ?? undefined,
      correctAnswer: body.correctAnswer,
    },
    include: {
      author: { select: { name: true } },
      student: { select: { user: { select: { name: true } } } },
    },
  });

  res.status(201).json(mapPost(row));
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  if (!req.user || (req.user.role !== 'DIRECTOR' && req.user.role !== 'IT_ADMIN' && req.user.role !== 'MANAGER')) {
    res.status(403).json({ message: 'Only admins can delete posts' });
    return;
  }

  const id = req.params.id;
  await prisma.post.delete({ where: { id } }).catch(() => {});
  res.json({ success: true });
}
