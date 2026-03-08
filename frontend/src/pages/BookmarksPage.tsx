import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Play, Clock, Tag, Trash2, Search } from 'lucide-react';
import { fetchBookmarks, deleteBookmark, searchTags } from '../api/bookmarks';
import type { Bookmark as BookmarkType, Tag as TagType } from '../types/api';
import styles from './BookmarksPage.module.css';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    searchTags('').then(setAllTags).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookmarks(activeTag ? { tag: activeTag } : undefined)
      .then(setBookmarks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeTag]);

  const handleNavigate = (b: BookmarkType) => {
    const parts = b.video_path.split('/');
    const filename = parts.pop()!;
    const dir = parts.join('/');
    navigate(`/browse/${dir}?play=${encodeURIComponent(filename)}&t=${b.position_seconds}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>
          <Tag size={16} />
          Filter by Tag
        </h3>
        <button
          className={`${styles.tagBtn} ${activeTag === null ? styles.tagActive : ''}`}
          onClick={() => setActiveTag(null)}
        >
          All bookmarks
        </button>
        {allTags.map((tag) => (
          <button
            key={tag.id}
            className={`${styles.tagBtn} ${activeTag === tag.name ? styles.tagActive : ''}`}
            onClick={() => setActiveTag(tag.name)}
          >
            {tag.name}
          </button>
        ))}
        {allTags.length === 0 && !loading && (
          <p className={styles.noTags}>No tags yet</p>
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Bookmark size={20} />
            Bookmarks
            {activeTag && <span className={styles.filterChip}>{activeTag}</span>}
          </h2>
          <span className={styles.count}>{bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}</span>
        </div>

        {loading && <div className={styles.loading}>Loading...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && bookmarks.length === 0 && (
          <div className={styles.empty}>
            <Search size={40} />
            <p>No bookmarks found{activeTag ? ` with tag "${activeTag}"` : ''}</p>
          </div>
        )}

        <div className={styles.grid}>
          {bookmarks.map((b) => (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <p className={styles.description}>{b.description}</p>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(b.id)}
                  title="Delete bookmark"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <Play size={13} />
                  {b.video_path.split('/').pop()}
                </span>
                <span className={styles.metaItem}>
                  <Clock size={13} />
                  {formatTime(b.position_seconds)}
                </span>
              </div>
              {b.tags.length > 0 && (
                <div className={styles.cardTags}>
                  {b.tags.map((t) => (
                    <span
                      key={t.id}
                      className={styles.tagChip}
                      onClick={() => setActiveTag(t.name)}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className={styles.cardFooter}>
                <span className={styles.date}>{formatDate(b.created_at)}</span>
                <button className={styles.playBtn} onClick={() => handleNavigate(b)}>
                  <Play size={14} />
                  Go to video
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
