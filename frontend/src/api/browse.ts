import type { BrowseResponse } from '../types/api';
import { apiFetch } from './client';

export async function fetchBrowse(path: string): Promise<BrowseResponse> {
  const encoded = path ? encodeURI(path) : '';
  return apiFetch<BrowseResponse>(`/browse/${encoded}`);
}
