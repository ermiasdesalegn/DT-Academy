import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useT } from '../../hooks/useT';
import { BLOG_POSTS, getPost } from '../../lib/blogPosts';

export function BlogPostPage() {
  const t = useT();
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="bg-[#f7f4ee] text-stone-900">
      <article className="mx-auto max-w-3xl px-4 pb-8 pt-12 sm:px-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 hover:text-[#1A2B3C]"
        >
          <ArrowLeft size={14} />
          {t('blog.allNotices')}
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-red-600">{t(`blog.${post.category}`)}</p>
        <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-stone-500">
          {post.date} · {post.author} · Debre Tabor
        </p>
      </article>
      <img
        src={post.image}
        alt=""
        className="mx-auto h-[420px] w-full max-w-5xl object-cover px-4 sm:rounded-[1.75rem] sm:px-6"
      />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-base leading-relaxed text-stone-700 sm:px-6">
        {post.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{t('blog.moreFromOffice')}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {more.map((item) => (
            <Link key={item.slug} to={`/blog/${item.slug}`} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200/80">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">{t(`blog.${item.category}`)}</p>
              <h2 className="mt-2 font-bold uppercase text-[#1A2B3C]">{item.title}</h2>
              <p className="mt-2 text-sm text-stone-500">{item.date}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
