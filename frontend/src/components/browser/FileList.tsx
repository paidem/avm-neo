import type { BrowseItem } from '../../types/api';
import FileRow from './FileRow';
import styles from './FileList.module.css';

interface Props {
  items: BrowseItem[];
  activeItem: string | null;
  onPlay: (item: BrowseItem) => void;
  onRefresh?: () => void;
}

export default function FileList({ items, activeItem, onPlay }: Props) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>This folder is empty</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thThumb}>Preview</th>
            <th>Name</th>
            <th className={styles.thSize}>Size</th>
            <th className={styles.thActions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <FileRow
              key={item.path}
              item={item}
              active={activeItem === item.path}
              onPlay={onPlay}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
