import { Router } from 'express';
import { listPosts, getPost, createPost, deletePost } from '../controllers/postController';
import { authMiddleware } from '../middleware/auth';

export const postsRouter = Router();

postsRouter.get('/', listPosts);
postsRouter.get('/:id', getPost);
postsRouter.post('/', authMiddleware, createPost);
postsRouter.delete('/:id', authMiddleware, deletePost);
