import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function BrowsePlaceholder() {
  return <div style={{ padding: 40 }}>Browse page - coming soon</div>;
}

function BookmarksPlaceholder() {
  return <div style={{ padding: 40 }}>Bookmarks page - coming soon</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/browse" replace />} />
        <Route path="/browse/*" element={<BrowsePlaceholder />} />
        <Route path="/bookmarks" element={<BookmarksPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}
