import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";
import { fetchPublishedBlogPosts } from "@/lib/blog-api";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";

export function BlogSection() {
  return (
    <Suspense fallback={<BlogSectionFallback />}>
      <BlogSectionContent />
    </Suspense>
  );
}

function BlogSectionFallback() {
  return (
    <section id="blog" className="scroll-mt-24 border-y border-line bg-cream px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto h-6 w-32 animate-pulse rounded bg-cream-dark/80" />
        <div className="mx-auto mt-4 h-10 w-2/3 max-w-md animate-pulse rounded bg-cream-dark/60" />
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <li key={key} className="overflow-hidden rounded-lg border border-line bg-cream">
              <div className="aspect-[16/10] animate-pulse bg-cream-dark/70" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-cream-dark/60" />
                <div className="h-6 w-full animate-pulse rounded bg-cream-dark/60" />
                <div className="h-4 w-full animate-pulse rounded bg-cream-dark/50" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function BlogSectionContent() {
  const t = await getTranslations("blogSection");
  const posts = await fetchPublishedBlogPosts(6);

  return (
    <section id="blog" className="scroll-mt-24 border-y border-line bg-cream px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        </Reveal>

        {posts.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">{t("empty")}</p>
        ) : (
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Reveal delay={index * 0.06}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-cream shadow-sm transition-shadow hover:shadow-md">
                    <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImageUrl ?? FALLBACK_COVER}
                        alt=""
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      {post.publishedAt ? (
                        <time
                          dateTime={post.publishedAt}
                          className="text-xs uppercase tracking-wide text-olive"
                        >
                          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                            new Date(post.publishedAt),
                          )}
                        </time>
                      ) : null}
                      <h3 className="mt-2 font-heading text-xl text-forest">
                        <Link href={`/blog/${post.slug}`} className="hover:text-rust">
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-4 text-sm font-medium text-forest underline-offset-2 hover:underline"
                      >
                        {t("readMore")}
                      </Link>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
