export interface VideoMetadata {
  duration: string | null;
  codec: string | null;
  framerate: string | null;
  creation_time: string | null;
}

export interface BrowseItem {
  name: string;
  path: string;
  is_dir: boolean;
  is_video: boolean;
  is_image: boolean;
  is_audio: boolean;
  thumbnail: string | null;
  video_metadata: VideoMetadata;
  source_files: string[] | null;
  size: string;
  raw_size: number;
  modified: string;
  file_count?: number;
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface BrowseResponse {
  items: BrowseItem[];
  breadcrumbs: Breadcrumb[];
  current_path: string;
  prev_dir: string | null;
  next_dir: string | null;
}

export interface AuthInfo {
  authenticated: boolean;
  username: string;
  role: 'admin' | 'viewer';
}

export interface Bookmark {
  id: number;
  description: string;
  video_path: string;
  video_date: string | null;
  position_seconds: number;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  screenshot_url: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface BookmarkCreate {
  description: string;
  video_path: string;
  video_date?: string | null;
  position_seconds: number;
  tags: string[];
}
