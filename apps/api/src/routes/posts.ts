import { Router } from 'express';
import { listPosts, getPost, createPost, deletePost } from '../controllers/postController';
import { requireAuth } from '../middleware/requireAuth';

export const postsRouter = Router();

postsRouter.get('/', listPosts);
postsRouter.get('/:id', getPost);
postsRouter.post('/', requireAuth, createPost);
postsRouter.delete('/:id', requireAuth, deletePost);
