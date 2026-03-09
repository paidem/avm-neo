import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './VideoPopup.module.css';

interface Props {
  videoPath: string;
  positionSeconds: number;
  onClose: () => void;
}

export default function VideoPopup({ videoPath, positionSeconds, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = positionSeconds;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.filename}>{videoPath.split('/').pop()}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <video
          ref={videoRef}
          className={styles.video}
          controls
          autoPlay
          preload="auto"
          src={`/api/view/${videoPath}`}
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>
    </div>
  );
}
