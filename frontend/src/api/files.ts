import { apiFetch } from './client';

export function mergeFiles(files: string[]) {
  return apiFetch<{ status: string; message: string }>('/files/merge', {
    method: 'POST',
    body: JSON.stringify({ files }),
  });
}

export function deleteFiles(files: string[]) {
  return apiFetch<{ status: string; message: string }>('/files/delete', {
    method: 'POST',
    body: JSON.stringify({ files }),
  });
}

export function renameFile(oldPath: string, newName: string) {
  return apiFetch<{ status: string; message: string }>('/files/rename', {
    method: 'POST',
    body: JSON.stringify({ old_path: oldPath, new_name: newName }),
  });
}

export function deleteSourceFiles(file: string) {
  return apiFetch<{ status: string; message: string }>('/files/delete-source', {
    method: 'POST',
    body: JSON.stringify({ files: [file] }),
  });
}
