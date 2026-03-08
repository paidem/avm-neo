import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { fetchBrowse } from '../api/browse';
import { fetchBookmarks } from '../api/bookmarks';
import type { BrowseResponse, BrowseItem } from '../types/api';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import FolderNavigation from '../components/browser/FolderNavigation';
import FileList from '../components/browser/FileList';
import MediaPreview from '../components/player/MediaPreview';
import Spinner from '../components/layout/Spinner';
import styles from './BrowsePage.module.css';

export default function BrowsePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const subpath = location.pathname.replace(/^\/browse\/?/, '');
  const decodedPath = decodeURIComponent(subpath);

  const [data, setData] = useState<BrowseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<BrowseItem | null>(null);
  const [bookmarkedPaths, setBookmarkedPaths] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchBookmarks()
      .then((bms) => setBookmarkedPaths(new Set(bms.map((b) => b.video_path))))
      .catch(() => {});
  }, [decodedPath]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveItem(null);
    setPreviewItem(null);
    fetchBrowse(decodedPath)
      .then((result) => {
        setData(result);
        // Handle ?play=filename&t=seconds query params (from bookmarks)
        const playFile = searchParams.get('play');
        const seekTime = searchParams.get('t');
        if (playFile) {
          const item = result.items.find((i) => i.name === playFile);
          if (item) {
            setActiveItem(item.path);
            setPreviewItem(item);
            if (seekTime && item.is_video) {
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = parseFloat(seekTime);
                }
              }, 500);
            }
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [decodedPath, searchParams]);

  const handlePlay = (item: BrowseItem) => {
    setActiveItem(item.path);
    setPreviewItem(item);
  };

  const handleClosePreview = () => {
    setActiveItem(null);
    setPreviewItem(null);
  };

  const refreshList = () => {
    fetchBrowse(decodedPath).then(setData).catch(() => {});
  };

  if (loading) {
    return <div className={styles.loading}><Spinner text="Loading files..." /></div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!data) return null;

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
          onRefresh={refreshList}
          bookmarkedPaths={bookmarkedPaths}
        />
      </div>

      <div className={styles.previewPanel}>
        <MediaPreview
          item={previewItem}
          onClose={handleClosePreview}
          videoRef={videoRef}
        />
      </div>
    </div>
  );
}
