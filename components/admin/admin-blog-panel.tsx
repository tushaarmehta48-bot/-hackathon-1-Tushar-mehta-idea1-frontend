"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogPosts,
  updateAdminBlogPost,
  uploadAdminBlogImage,
} from "@/lib/admin-blog-api";
import type { BlogPost } from "@/lib/blog-api";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

type AdminBlogPanelProps = {
  token: string | null;
  onError: (message: string) => void;
};

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminBlogPanel({ token, onError }: AdminBlogPanelProps) {
  const t = useTranslations("adminConsole.blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [coverUrlInput, setCoverUrlInput] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      setPosts(await fetchAdminBlogPosts(token));
    } catch (error) {
      if (error instanceof ApiError && /blog_posts/i.test(error.message)) {
        onError(t("errors.migration"));
      } else if (error instanceof ApiError && error.message) {
        onError(error.message);
      } else {
        onError(t("errors.load"));
      }
    } finally {
      setLoading(false);
    }
  }, [token, onError, t]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setExcerpt("");
    setBody("");
    setCoverImageUrl("");
    setGalleryUrls([]);
    setCoverUrlInput("");
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setSlugTouched(true);
    setExcerpt(post.excerpt ?? "");
    setBody(post.body);
    setCoverImageUrl(post.coverImageUrl ?? "");
    setGalleryUrls(post.galleryUrls ?? []);
    setCoverUrlInput("");
  }

  async function handleUpload(file: File, target: "cover" | "gallery") {
    if (!token) {
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadAdminBlogImage(token, file);
      if (target === "cover") {
        setCoverImageUrl(url);
      } else {
        setGalleryUrls((prev) => [...prev, url]);
      }
    } catch {
      onError(t("errors.upload"));
    } finally {
      setBusy(false);
    }
  }

  async function save(status: "draft" | "published") {
    if (!token || !title.trim() || !slug.trim()) {
      onError(t("errors.required"));
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || undefined,
        body,
        coverImageUrl: coverImageUrl.trim() || undefined,
        galleryUrls,
        status,
      };
      if (editingId) {
        await updateAdminBlogPost(token, editingId, payload);
      } else {
        await createAdminBlogPost(token, payload);
      }
      resetForm();
      await load();
    } catch {
      onError(t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function removePost(id: string) {
    if (!token || !window.confirm(t("deleteConfirm"))) {
      return;
    }
    setBusy(true);
    try {
      await deleteAdminBlogPost(token, id);
      if (editingId === id) {
        resetForm();
      }
      await load();
    } catch {
      onError(t("errors.delete"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <section className="space-y-4 rounded-lg border border-line bg-cream p-5 shadow-sm lg:col-span-3">
        <div>
          <h2 className="font-heading text-xl text-forest">{editingId ? t("editTitle") : t("createTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("hint")}</p>
        </div>

        <label className="block text-sm">
          {t("fieldTitle")}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const next = e.target.value;
              setTitle(next);
              if (!slugTouched) {
                setSlug(slugifyTitle(next));
              }
            }}
            className="mt-1 block w-full rounded-sm border border-line bg-cream px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          {t("fieldSlug")}
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="mt-1 block w-full rounded-sm border border-line bg-cream px-3 py-2 font-mono text-xs"
          />
        </label>

        <label className="block text-sm">
          {t("fieldExcerpt")}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-sm border border-line bg-cream px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          {t("fieldBody")}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-sm border border-line bg-cream px-3 py-2 leading-relaxed"
          />
        </label>

        <div className="space-y-3 rounded-sm border border-line/80 bg-cream-dark/20 p-4">
          <p className="text-sm font-medium text-forest">{t("imagesTitle")}</p>
          <label className="block text-sm">
            {t("coverUpload")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={busy}
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleUpload(file, "cover");
                }
                e.target.value = "";
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="url"
              placeholder={t("coverUrlPlaceholder")}
              value={coverUrlInput}
              onChange={(e) => setCoverUrlInput(e.target.value)}
              className="min-w-[12rem] flex-1 rounded-sm border border-line px-2 py-1.5 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={!coverUrlInput.trim()}
              onClick={() => {
                setCoverImageUrl(coverUrlInput.trim());
                setCoverUrlInput("");
              }}
            >
              {t("useUrl")}
            </Button>
          </div>
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" className="mt-2 max-h-40 rounded-sm border border-line object-cover" />
          ) : null}

          <label className="block text-sm">
            {t("galleryUpload")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={busy}
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleUpload(file, "gallery");
                }
                e.target.value = "";
              }}
            />
          </label>
          {galleryUrls.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {galleryUrls.map((url) => (
                <li key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-20 w-28 rounded-sm border border-line object-cover" />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 rounded-full bg-rust px-1.5 text-xs text-cream"
                    onClick={() => setGalleryUrls((prev) => prev.filter((row) => row !== url))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => void save("draft")}>
            {t("saveDraft")}
          </Button>
          <Button type="button" variant="primary" disabled={busy} onClick={() => void save("published")}>
            {t("publish")}
          </Button>
          {editingId ? (
            <Button type="button" variant="secondary" disabled={busy} onClick={resetForm}>
              {t("cancelEdit")}
            </Button>
          ) : null}
        </div>
      </section>

      <aside className="space-y-3 lg:col-span-2">
        <h3 className="font-heading text-lg text-forest">{t("listTitle")}</h3>
        {loading ? (
          <p className="text-sm text-muted">{t("loading")}</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-cream">
            {posts.map((post) => (
              <li key={post.id} className="space-y-2 px-4 py-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-forest">{post.title}</p>
                    <p className="text-xs text-muted">{post.slug}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs uppercase tracking-wide ${
                      post.status === "published" ? "text-olive" : "text-muted"
                    }`}
                  >
                    {post.status === "published" ? t("statusPublished") : t("statusDraft")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-xs text-forest underline"
                    onClick={() => startEdit(post)}
                  >
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-rust underline"
                    onClick={() => void removePost(post.id)}
                  >
                    {t("delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
