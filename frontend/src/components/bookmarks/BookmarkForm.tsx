import { useState, useEffect } from 'react';
import { Bookmark, X } from 'lucide-react';
import { createBookmark } from '../../api/bookmarks';
import TagInput from './TagInput';
import styles from './BookmarkForm.module.css';

interface Props {
  open: boolean;
  videoPath: string;
  videoDate?: string | null;
  positionSeconds: number;
  onClose: () => void;
  onCreated?: () => void;
}

export default function BookmarkForm({ open, videoPath, videoDate, positionSeconds, onClose, onCreated }: Props) {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDescription('');
      setTags([]);
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createBookmark({
        description: description.trim(),
        video_path: videoPath,
        video_date: videoDate,
        position_seconds: positionSeconds,
        tags,
      });
      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <Bookmark size={18} />
            Add Bookmark
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.info}>
          <span className={styles.infoLabel}>Video:</span>
          <span className={styles.infoValue}>{videoPath.split('/').pop()}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.infoLabel}>Position:</span>
          <span className={styles.infoValue}>{formatTime(positionSeconds)}</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe this moment..."
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label>Tags</label>
            <TagInput selectedTags={tags} onChange={setTags} />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save Bookmark'}
          </button>
        </form>
      </div>
    </div>
  );
}
