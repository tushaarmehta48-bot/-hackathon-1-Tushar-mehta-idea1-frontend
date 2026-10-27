import { apiGet } from "@/lib/api-client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImageUrl: string | null;
  galleryUrls: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchPublishedBlogPosts(limit = 6): Promise<BlogPost[]> {
  try {
    return await apiGet<BlogPost[]>(`/blog?limit=${limit}`);
  } catch {
    return [];
  }
}

export async function fetchPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiGet<BlogPost>(`/blog/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}
