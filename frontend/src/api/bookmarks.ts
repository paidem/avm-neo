import { apiFetch } from './client';
import type { Bookmark, BookmarkCreate, Tag } from '../types/api';

export function fetchBookmarks(params?: { tag?: string; video_path?: string }): Promise<Bookmark[]> {
  const sp = new URLSearchParams();
  if (params?.tag) sp.set('tag', params.tag);
  if (params?.video_path) sp.set('video_path', params.video_path);
  const qs = sp.toString();
  return apiFetch<Bookmark[]>(`/bookmarks${qs ? `?${qs}` : ''}`);
}

export function createBookmark(data: BookmarkCreate): Promise<Bookmark> {
  return apiFetch<Bookmark>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBookmark(id: number, data: { description?: string; tags?: string[] }): Promise<Bookmark> {
  return apiFetch<Bookmark>(`/bookmarks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBookmark(id: number): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/bookmarks/${id}`, {
    method: 'DELETE',
  });
}

export async function searchTags(query: string): Promise<Tag[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiFetch<Tag[]>(`/tags${qs}`);
}
