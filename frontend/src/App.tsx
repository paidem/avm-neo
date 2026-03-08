import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import BrowsePage from './pages/BrowsePage';

function BookmarksPlaceholder() {
  return <div style={{ padding: 40 }}>Bookmarks page - coming soon</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse/*" element={<BrowsePage />} />
          <Route path="/bookmarks" element={<BookmarksPlaceholder />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
