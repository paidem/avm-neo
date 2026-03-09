import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { renameFile } from '../../api/files';
import styles from './RenameDialog.module.css';

interface Props {
  open: boolean;
  filePath: string;
  onClose: () => void;
  onSuccess: (newName?: string) => void;
}

export default function RenameDialog({ open, filePath, onClose, onSuccess }: Props) {
  const lastSlash = filePath.lastIndexOf('/');
  const currentName = filePath.substring(lastSlash + 1);

  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNewName(currentName);
      setError('');
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          const dotIdx = currentName.lastIndexOf('.');
          if (dotIdx > 0) {
            input.setSelectionRange(0, dotIdx);
          } else {
            input.select();
          }
        }
      }, 100);
    }
  }, [open, currentName]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }
    if (trimmed.includes('/')) {
      setError('Name cannot contain /');
      return;
    }
    if (trimmed === currentName) {
      setError('Name is unchanged');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await renameFile(filePath, trimmed);
      if (result.status === 'success') {
        onSuccess(trimmed);
        onClose();
      } else {
        setError(result.message);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Rename</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Current name</label>
            <input type="text" value={currentName} disabled />
          </div>
          <div className={styles.field}>
            <label>New name</label>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
