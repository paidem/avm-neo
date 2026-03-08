import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Eye, LogIn, LogOut, Bookmark, FolderOpen, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LoginModal from '../auth/LoginModal';
import styles from './Header.module.css';

export default function Header() {
  const { authenticated, username, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <h1 className={styles.title}>Action Video Manager</h1>
          <nav className={styles.nav}>
            <Link
              to="/browse"
              className={`${styles.navLink} ${location.pathname.startsWith('/browse') ? styles.active : ''}`}
            >
              <FolderOpen size={16} />
              Browse
            </Link>
            <Link
              to="/bookmarks"
              className={`${styles.navLink} ${location.pathname === '/bookmarks' ? styles.active : ''}`}
            >
              <Bookmark size={16} />
              Bookmarks
            </Link>
          </nav>
        </div>

        <div className={styles.right}>
          <button className={styles.themeBtn} onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className={styles.authBadge}>
            {authenticated ? (
              <>
                <span className={styles.badgeAdmin}>
                  <Shield size={14} />
                  {username}
                </span>
                <button className={styles.authBtn} onClick={logout} title="Log out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <span className={styles.badgeViewer}>
                  <Eye size={14} />
                  {username}
                </span>
                <button className={styles.authBtn} onClick={() => setLoginOpen(true)} title="Log in">
                  <LogIn size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
