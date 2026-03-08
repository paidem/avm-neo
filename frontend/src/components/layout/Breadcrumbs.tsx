import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { Breadcrumb } from '../../types/api';
import styles from './Breadcrumbs.module.css';

interface Props {
  breadcrumbs: Breadcrumb[];
}

export default function Breadcrumbs({ breadcrumbs }: Props) {
  return (
    <nav className={styles.breadcrumbs}>
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.path} className={styles.item}>
          {i > 0 && <ChevronRight size={14} className={styles.sep} />}
          {i === breadcrumbs.length - 1 ? (
            <span className={styles.current}>
              {i === 0 ? <Home size={14} /> : null}
              {crumb.name}
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
