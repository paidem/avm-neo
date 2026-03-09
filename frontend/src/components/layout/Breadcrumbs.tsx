import { Link } from 'react-router-dom';
import { ChevronRight, Home, Pencil } from 'lucide-react';
import type { Breadcrumb } from '../../types/api';
import styles from './Breadcrumbs.module.css';

interface Props {
  breadcrumbs: Breadcrumb[];
  onRenameFolder?: () => void;
}

export default function Breadcrumbs({ breadcrumbs, onRenameFolder }: Props) {
  return (
    <nav className={styles.breadcrumbs}>
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.path} className={styles.item}>
          {i > 0 && <ChevronRight size={14} className={styles.sep} />}
          {i === breadcrumbs.length - 1 ? (
            <span className={styles.current}>
              {i === 0 ? <Home size={14} /> : null}
              {crumb.name}
              {i > 0 && onRenameFolder && (
                <button
                  className={styles.renameBtn}
                  onClick={onRenameFolder}
                  title="Rename folder"
                >
                  <Pencil size={12} />
                </button>
              )}
            </span>
          ) : (
            <Link to={`/browse/${crumb.path}`} className={styles.link}>
              {i === 0 ? <Home size={14} /> : null}
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
