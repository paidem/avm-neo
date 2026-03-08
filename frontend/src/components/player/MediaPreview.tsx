import { useRef, useState } from 'react';
import { X, Music, Bookmark } from 'lucide-react';
import type { BrowseItem } from '../../types/api';
import BookmarkForm from '../bookmarks/BookmarkForm';
import styles from './MediaPreview.module.css';

interface Props {
  item: BrowseItem | null;
  onClose: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function MediaPreview({ item, onClose, videoRef }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef || localVideoRef;
  const [bookmarkOpen, setBookmarkOpen] = useState(false);

  if (!item) {
    return (
      <div className={styles.placeholder}>
        <p>Select a file to preview</p>
      </div>
    );
  }

  const mediaType = item.is_video ? 'video' : item.is_image ? 'image' : item.is_audio ? 'audio' : null;

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <span className={styles.title}>{item.name}</span>
        <div className={styles.headerActions}>
          {item.is_video && (
            <button className={styles.bookmarkBtn} onClick={() => setBookmarkOpen(true)} title="Add bookmark">
              <Bookmark size={16} />
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      {mediaType === 'video' && (
        <video
          ref={ref}
          className={styles.video}
          controls
          autoPlay
          preload="auto"
          key={item.path}
          src={`/api/view/${item.path}`}
        />
      )}
      {mediaType === 'image' && (
        <img
          className={styles.image}
          src={`/api/view/${item.path}`}
          alt={item.name}
        />
      )}
      {mediaType === 'audio' && (
        <div className={styles.audio}>
          <Music size={64} className={styles.audioIcon} />
          <audio controls autoPlay key={item.path} src={`/api/view/${item.path}`} />
        </div>
      )}

      <BookmarkForm
        open={bookmarkOpen}
        videoPath={item.path}
        videoDate={item.video_metadata?.creation_time || item.modified}
        positionSeconds={ref.current?.currentTime ?? 0}
        onClose={() => setBookmarkOpen(false)}
      />
    </div>
  );
}
