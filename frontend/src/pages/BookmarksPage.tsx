import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Play, FolderOpen, Tag, Trash2, Search, Pencil, Check, X } from 'lucide-react';
import { fetchBookmarks, deleteBookmark, updateBookmark, searchTags } from '../api/bookmarks';
import TagInput from '../components/bookmarks/TagInput';
import VideoPopup from '../components/bookmarks/VideoPopup';
import { useAuth } from '../context/AuthContext';
import type { Bookmark as BookmarkType, Tag as TagType } from '../types/api';
import Spinner from '../components/layout/Spinner';
import styles from './BookmarksPage.module.css';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [popupBookmark, setPopupBookmark] = useState<BookmarkType | null>(null);
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  const refreshTags = () => searchTags('').then(setAllTags).catch(() => {});

  useEffect(() => {
    refreshTags();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookmarks(activeTag ? { tag: activeTag } : undefined)
      .then(setBookmarks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeTag]);

  const handlePlay = (b: BookmarkType) => {
    setPopupBookmark(b);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      refreshTags();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const startEdit = (b: BookmarkType) => {
    setEditingId(b.id);
    setEditDesc(b.description);
    setEditTags(b.tags.map((t) => t.name));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      const updated = await updateBookmark(editingId, {
        description: editDesc.trim(),
        tags: editTags,
      });
      setBookmarks((prev) => prev.map((b) => (b.id === editingId ? updated : b)));
      setEditingId(null);
      refreshTags();
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

        {loading && <Spinner text="Loading bookmarks..." />}
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
              {editingId === b.id ? (
                <>
                  <div className={styles.cardThumbnail}>
                    <img
                      src={b.screenshot_url}
                      alt={b.description}
                      className={styles.screenshotImg}
                    />
                    <span className={styles.timestamp}>
                      {formatTime(b.position_seconds)}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.editField}>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                    </div>
                    <div className={styles.editField}>
                      <TagInput selectedTags={editTags} onChange={setEditTags} />
                    </div>
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={saveEdit}>
                        <Check size={14} /> Save
                      </button>
                      <button className={styles.cancelBtn} onClick={cancelEdit}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.cardThumbnail} onClick={() => handlePlay(b)}>
                    <img
                      src={b.screenshot_url}
                      alt={b.description}
                      className={styles.screenshotImg}
                      loading="lazy"
                    />
                    <div className={styles.playOverlay}>
                      <Play size={32} />
                    </div>
                    <span className={styles.timestamp}>
                      {formatTime(b.position_seconds)}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <p className={styles.description}>{b.description}</p>
                      {authenticated && (
                        <div className={styles.cardActions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => startEdit(b)}
                            title="Edit bookmark"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(b.id)}
                            title="Delete bookmark"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.cardMeta}>
                      <a
                        className={styles.videoLink}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const parts = b.video_path.split('/');
                          const filename = parts.pop()!;
                          const dir = parts.join('/');
                          navigate(`/browse/${dir}?play=${encodeURIComponent(filename)}&t=${b.position_seconds}`);
                        }}
                        title="Open in folder"
                      >
                        <FolderOpen size={13} />
                        {b.video_path}
                      </a>
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
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {popupBookmark && (
        <VideoPopup
          videoPath={popupBookmark.video_path}
          positionSeconds={popupBookmark.position_seconds}
          onClose={() => setPopupBookmark(null)}
        />
      )}
    </div>
  );
}
