import { useNavigate } from 'react-router-dom';
import {
  Folder, Film, Image, Music, FileText,
  Play, ExternalLink, Download,
} from 'lucide-react';
import type { BrowseItem } from '../../types/api';
import styles from './FileRow.module.css';

interface Props {
  item: BrowseItem;
  active: boolean;
  onPlay: (item: BrowseItem) => void;
}

export default function FileRow({ item, active, onPlay }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.is_dir) {
      navigate(`/browse/${item.path}`);
    } else if (item.is_video || item.is_image || item.is_audio) {
      onPlay(item);
    }
  };

  const icon = item.is_dir ? (
    <Folder size={28} className={styles.iconFolder} />
  ) : item.is_video ? (
    <Film size={28} className={styles.iconVideo} />
  ) : item.is_image ? (
    <Image size={28} className={styles.iconImage} />
  ) : item.is_audio ? (
    <Music size={28} className={styles.iconAudio} />
  ) : (
    <FileText size={28} className={styles.iconFile} />
  );

  return (
    <tr className={`${styles.row} ${active ? styles.active : ''}`}>
      <td className={styles.thumbCell} onClick={handleClick}>
        <div className={styles.thumb}>
          {item.thumbnail ? (
            <img src={item.thumbnail} alt="" />
          ) : (
            icon
          )}
        </div>
      </td>
      <td className={styles.nameCell} onClick={handleClick}>
        <div className={styles.name}>{item.name}</div>
        {item.is_video && item.video_metadata && (
          <div className={styles.meta}>
            {item.video_metadata.duration && (
              <span className={styles.metaItem}>{item.video_metadata.duration}</span>
            )}
            {item.video_metadata.codec && (
              <span className={styles.metaItem}>{item.video_metadata.codec}</span>
            )}
            {item.video_metadata.framerate && (
              <span className={styles.metaItem}>{item.video_metadata.framerate}</span>
            )}
            {item.video_metadata.creation_time && (
              <span className={styles.metaItem}>{item.video_metadata.creation_time}</span>
            )}
          </div>
        )}
        {item.source_files && (
          <div className={styles.sourceFiles}>
            <span className={styles.sourceTitle}>Merged from:</span>
            {item.source_files.map((s, i) => (
              <span key={i} className={styles.sourceItem}>{s}</span>
            ))}
          </div>
        )}
      </td>
      <td className={styles.sizeCell}>
        <span title={item.modified}>{item.size}</span>
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          {!item.is_dir && (item.is_video || item.is_image || item.is_audio) && (
            <button className={styles.actionBtn} onClick={() => onPlay(item)} title="Play">
              <Play size={14} />
            </button>
          )}
          {!item.is_dir && (
            <>
              <a
                href={`/api/view/${item.path}`}
                target="_blank"
                rel="noopener"
                className={styles.actionBtn}
                title="Open in new tab"
              >
                <ExternalLink size={14} />
              </a>
              <a
                href={`/api/download/${item.path}`}
                className={styles.actionBtn}
                title="Download"
              >
                <Download size={14} />
              </a>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
