import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_BLOG_POSTS, DEFAULT_BLOG_POSTS_AM, DEFAULT_HOME_PAGE_AM, DEFAULT_SITE_CONTENT, mergeBlogPosts, mergeHomePage, mergeSiteCopyAm, type ISiteContent } from '@dt-academy/types';
import { api } from '../services/api';

function normalize(data: ISiteContent): ISiteContent {
  return {
    ...data,
    home: mergeHomePage(data.home),
    copyAm: mergeSiteCopyAm(data.copyAm),
    homeAm: mergeHomePage(data.homeAm, DEFAULT_HOME_PAGE_AM),
    blog: mergeBlogPosts(data.blog, DEFAULT_BLOG_POSTS),
    blogAm: mergeBlogPosts(data.blogAm, DEFAULT_BLOG_POSTS_AM),
  };
}

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data } = await api.get<ISiteContent>('/site-content');
      return normalize(data);
    },
    placeholderData: DEFAULT_SITE_CONTENT,
  });
}

export function useUploadSiteImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      const { data } = await api.post<{ url: string }>('/site-content/upload', body);
      return data.url;
    },
  });
}

export function useUpdateSiteContent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ISiteContent) => {
      const { data } = await api.put<ISiteContent>('/site-content', body);
      return data;
    },
    onSuccess: (data) => {
      client.setQueryData(['site-content'], normalize(data));
    },
  });
}
