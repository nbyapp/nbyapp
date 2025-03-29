import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AppCreatorPage from './pages/AppCreatorPage';
import AppGalleryPage from './pages/AppGalleryPage';
import AppPreviewPage from './pages/AppPreviewPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="create" element={<AppCreatorPage />} />
        <Route path="gallery" element={<AppGalleryPage />} />
        <Route path="preview/:appId" element={<AppPreviewPage />} />
      </Route>
    </Routes>
  );
}

export default App;