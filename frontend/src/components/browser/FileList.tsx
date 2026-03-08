import { useState } from 'react';
import { Merge, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mergeFiles, deleteFiles } from '../../api/files';
import type { BrowseItem } from '../../types/api';
import FileRow from './FileRow';
import RenameDialog from './RenameDialog';
import styles from './FileList.module.css';

interface Props {
  items: BrowseItem[];
  activeItem: string | null;
  onPlay: (item: BrowseItem) => void;
  onRefresh?: () => void;
  bookmarkedPaths?: Set<string>;
}

export default function FileList({ items, activeItem, onPlay, onRefresh, bookmarkedPaths }: Props) {
  const { authenticated } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileItems = items.filter((i) => !i.is_dir);

  const toggleItem = (path: string) => {
    const next = new Set(selected);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === fileItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(fileItems.map((i) => i.path)));
    }
  };

  const handleMerge = async () => {
    if (selected.size < 2) return alert('Select at least 2 files to merge');
    setLoading(true);
    try {
      const result = await mergeFiles(Array.from(selected));
      alert(result.message);
      setSelected(new Set());
      onRefresh?.();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (selected.size === 0) return alert('Select at least one file');
    if (!confirm(`Delete ${selected.size} file(s)?`)) return;
    setLoading(true);
    try {
      await deleteFiles(Array.from(selected));
      setSelected(new Set());
      onRefresh?.();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return <div className={styles.empty}><p>This folder is empty</p></div>;
  }

  return (
    <>
      {authenticated && (
        <div className={styles.actionBar}>
          <div className={styles.actionButtons}>
            <button className={styles.mergeBtn} onClick={handleMerge} disabled={loading}>
              <Merge size={14} /> Merge
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <label className={styles.selectAll}>
            <input
              type="checkbox"
              checked={selected.size === fileItems.length && fileItems.length > 0}
              onChange={toggleAll}
            />
            Select all
          </label>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {authenticated && <th className={styles.thCheck}></th>}
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
                selected={selected.has(item.path)}
                onPlay={onPlay}
                onToggleSelect={toggleItem}
                onRename={setRenameTarget}
                onRefresh={onRefresh}
                hasBookmark={bookmarkedPaths?.has(item.path)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <RenameDialog
        open={!!renameTarget}
        filePath={renameTarget || ''}
        onClose={() => setRenameTarget(null)}
        onSuccess={() => onRefresh?.()}
      />
    </>
  );
}
