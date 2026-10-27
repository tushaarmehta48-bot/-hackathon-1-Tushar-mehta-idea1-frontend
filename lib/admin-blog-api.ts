import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "@/lib/api-client";
import type { BlogPost } from "@/lib/blog-api";

export type CreateBlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
  status?: "draft" | "published";
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput> & {
  coverImageUrl?: string | null;
};

export async function fetchAdminBlogPosts(token: string): Promise<BlogPost[]> {
  return apiGet<BlogPost[]>("/admin/blog", { accessToken: token });
}

export async function createAdminBlogPost(token: string, body: CreateBlogPostInput): Promise<BlogPost> {
  return apiPost<BlogPost>("/admin/blog", body, token);
}

export async function updateAdminBlogPost(
  token: string,
  id: string,
  body: UpdateBlogPostInput,
): Promise<BlogPost> {
  return apiPatch<BlogPost>(`/admin/blog/${id}`, body, token);
}

export async function deleteAdminBlogPost(token: string, id: string): Promise<{ ok: true }> {
  return apiDelete<{ ok: true }>(`/admin/blog/${id}`, token);
}

export async function uploadAdminBlogImage(token: string, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<{ url: string }>("/admin/blog/upload-image", form, token);
}
