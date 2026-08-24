import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useFormat } from '../../hooks/useFormat';
import { useT } from '../../hooks/useT';

export function BlogPostPage() {
  const t = useT();
  const { date } = useFormat();
  const { slug } = useParams();
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();
  const posts = site.blog ?? [];
  const post = slug ? posts.find((p) => p.slug === slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

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
          {date(post.date)} · {post.author}
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
              <p className="mt-2 text-sm text-stone-500">{date(item.date)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
