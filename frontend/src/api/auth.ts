import type { AuthInfo } from '../types/api';

export async function fetchMe(): Promise<AuthInfo> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  return res.json();
}

export async function login(password: string): Promise<{ status: string; message: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `password=${encodeURIComponent(password)}`,
  });
  return res.json();
}

export async function logout(): Promise<{ status: string; message: string }> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}
