import { useState } from 'react';
import { Merge, Trash2, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mergeFiles, deleteFiles } from '../../api/files';
import type { BrowseItem } from '../../types/api';
import styles from './ActionBar.module.css';

interface Props {
  items: BrowseItem[];
  onRefresh: () => void;
}

export default function ActionBar({ items, onRefresh }: Props) {
  const { authenticated } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  if (!authenticated) return null;

  const fileItems = items.filter((i) => !i.is_dir);

  const toggleAll = () => {
    if (selected.size === fileItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(fileItems.map((i) => i.path)));
    }
  };

  const toggleItem = (path: string) => {
    const next = new Set(selected);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelected(next);
  };

  const handleMerge = async () => {
    if (selected.size < 2) {
      alert('Select at least 2 files to merge');
      return;
    }
    setLoading(true);
    try {
      const result = await mergeFiles(Array.from(selected));
      alert(result.message);
      setSelected(new Set());
      onRefresh();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (selected.size === 0) {
      alert('Select at least one file');
      return;
    }
    if (!confirm(`Delete ${selected.size} file(s)?`)) return;
    setLoading(true);
    try {
      await deleteFiles(Array.from(selected));
      setSelected(new Set());
      onRefresh();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  return {
    bar: (
      <div className={styles.bar}>
        <div className={styles.buttons}>
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
          <CheckSquare size={14} />
          Select all
        </label>
      </div>
    ),
    selected,
    toggleItem,
  };
}
