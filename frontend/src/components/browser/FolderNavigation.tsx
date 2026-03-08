import { useNavigate } from 'react-router-dom';
import { SkipBack, SkipForward } from 'lucide-react';
import styles from './FolderNavigation.module.css';

interface Props {
  prevDir: string | null;
  nextDir: string | null;
}

export default function FolderNavigation({ prevDir, nextDir }: Props) {
  const navigate = useNavigate();

  if (!prevDir && !nextDir) return null;

  return (
    <div className={styles.nav}>
      <button
        className={styles.btn}
        disabled={!prevDir}
        onClick={() => prevDir && navigate(`/browse/${prevDir}`)}
        title={prevDir || undefined}
      >
        <SkipBack size={16} />
      </button>
      <button
        className={styles.btn}
        disabled={!nextDir}
        onClick={() => nextDir && navigate(`/browse/${nextDir}`)}
        title={nextDir || undefined}
      >
        <SkipForward size={16} />
      </button>
    </div>
  );
}
