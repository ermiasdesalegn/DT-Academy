import { ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory } from '../../lib/blogPosts';

export function BlogPage() {
  const [category, setCategory] = useState<(typeof BLOG_CATEGORIES)[number]>('All');
  const posts = useMemo(
    () => (category === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === category)),
    [category]
  );
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="bg-[#f7f4ee] text-stone-900">
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Blog</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-xl text-4xl font-bold uppercase leading-tight sm:text-5xl">School news</h1>
          <p className="max-w-sm text-sm leading-relaxed text-stone-600">
            Notices from the office and stories from classrooms in Debre Tabor. This is not a public comment board.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                category === item ? 'bg-[#1A2B3C] text-white' : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            to={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-[1.75rem] bg-[#1A2B3C] text-white lg:grid-cols-2"
          >
            <img
              src={featured.image}
              alt=""
              className="h-72 w-full object-cover object-top lg:h-full lg:min-h-[420px]"
            />
            <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">{featured.category}</p>
              <p className="mt-2 text-xs text-white/50">
                {featured.date} · {featured.author}
              </p>
              <h2 className="mt-4 text-3xl font-bold uppercase leading-tight sm:text-4xl">{featured.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/75">{featured.excerpt}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase text-white">
                Read the notice
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 transition group-hover:bg-red-500">
                  <ArrowUpRight size={14} />
                </span>
              </span>
            </div>
          </Link>
        </section>
      ) : (
        <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-stone-500 sm:px-6">No notices in this category yet.</p>
      )}

      {rest.length > 0 ? (
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </section>
      ) : (
        <div className="h-16" />
      )}
    </div>
  );
}

function ArticleCard({
  post,
}: {
  post: { slug: string; title: string; excerpt: string; category: BlogCategory; date: string; image: string };
}) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/80"
    >
      <img src={post.image} alt="" className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">{post.category}</p>
        <p className="mt-1 text-xs text-stone-400">{post.date}</p>
        <h3 className="mt-3 text-lg font-bold uppercase leading-snug text-[#1A2B3C]">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{post.excerpt}</p>
        <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#1A2B3C]">Read more</span>
      </div>
    </Link>
  );
}
