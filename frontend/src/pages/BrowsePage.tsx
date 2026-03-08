import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchBrowse } from '../api/browse';
import type { BrowseResponse, BrowseItem } from '../types/api';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import FolderNavigation from '../components/browser/FolderNavigation';
import FileList from '../components/browser/FileList';
import styles from './BrowsePage.module.css';

export default function BrowsePage() {
  const location = useLocation();
  const subpath = location.pathname.replace(/^\/browse\/?/, '');
  const decodedPath = decodeURIComponent(subpath);

  const [data, setData] = useState<BrowseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<BrowseItem | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveItem(null);
    setPreviewItem(null);
    fetchBrowse(decodedPath)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [decodedPath]);

  const handlePlay = (item: BrowseItem) => {
    setActiveItem(item.path);
    setPreviewItem(item);
  };

  const handleClosePreview = () => {
    setActiveItem(null);
    setPreviewItem(null);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!data) return null;

  const mediaType = previewItem?.is_video
    ? 'video'
    : previewItem?.is_image
      ? 'image'
      : previewItem?.is_audio
        ? 'audio'
        : null;

  return (
    <div className={styles.page}>
      <div className={styles.filePanel}>
        <div className={styles.topBar}>
          <Breadcrumbs breadcrumbs={data.breadcrumbs} />
          <FolderNavigation prevDir={data.prev_dir} nextDir={data.next_dir} />
        </div>
        <FileList
          items={data.items}
          activeItem={activeItem}
          onPlay={handlePlay}
        />
      </div>

      <div className={styles.previewPanel}>
        {previewItem && mediaType ? (
          <div className={styles.previewContent}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>{previewItem.name}</span>
              <button className={styles.closeBtn} onClick={handleClosePreview}>
                Close
              </button>
            </div>
            {mediaType === 'video' && (
              <video
                className={styles.videoPlayer}
                controls
                autoPlay
                preload="auto"
                src={`/api/view/${previewItem.path}`}
              />
            )}
            {mediaType === 'image' && (
              <img
                className={styles.imageViewer}
                src={`/api/view/${previewItem.path}`}
                alt={previewItem.name}
              />
            )}
            {mediaType === 'audio' && (
              <div className={styles.audioContainer}>
                <Music size={64} className={styles.audioIcon} />
                <audio controls autoPlay src={`/api/view/${previewItem.path}`} />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p>Select a file to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Need to import Music for the audio case
import { Music } from 'lucide-react';
