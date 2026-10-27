import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchPublishedBlogPost } from "@/lib/blog-api";

type BlogArticlePageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  return (
    <Suspense fallback={<BlogArticleFallback />}>
      <BlogArticleContent params={params} />
    </Suspense>
  );
}

function BlogArticleFallback() {
  return (
    <main id="main" className="flex-1 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-cream-dark/70" />
        <div className="h-10 w-full rounded bg-cream-dark/60" />
        <div className="aspect-[2/1] w-full rounded-lg bg-cream-dark/50" />
        <div className="h-4 w-full rounded bg-cream-dark/40" />
        <div className="h-4 w-full rounded bg-cream-dark/40" />
        <div className="h-4 w-3/4 rounded bg-cream-dark/40" />
      </div>
    </main>
  );
}

async function BlogArticleContent({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await fetchPublishedBlogPost(slug);
  if (!post) {
    notFound();
  }

  const t = await getTranslations("blogArticle");

  return (
    <main id="main" className="flex-1 px-4 py-12 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href={{ pathname: "/", hash: "blog" }} className="text-sm text-muted hover:text-forest">
          ← {t("back")}
        </Link>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt} className="mt-6 block text-xs uppercase tracking-wide text-olive">
            {new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(post.publishedAt))}
          </time>
        ) : null}
        <h1 className="mt-3 font-heading text-4xl text-forest">{post.title}</h1>
        {post.excerpt ? <p className="mt-4 text-lg text-muted">{post.excerpt}</p> : null}
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            className="mt-8 w-full rounded-lg border border-line object-cover"
          />
        ) : null}
        <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-wrap text-base leading-relaxed text-forest">
          {post.body}
        </div>
        {post.galleryUrls.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {post.galleryUrls.map((url) => (
              <li key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full rounded-sm border border-line object-cover" />
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </main>
  );
}
