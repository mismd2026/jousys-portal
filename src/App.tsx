import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StatusBoardPage from './pages/StatusBoardPage';
import StatusAdminPage from './pages/StatusAdminPage';
import KnowledgePage from './pages/KnowledgePage';
import KnowledgeArticlePage from './pages/KnowledgeArticlePage';
import VideosPage from './pages/VideosPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="status" element={<StatusBoardPage />} />
        <Route path="status/admin" element={<StatusAdminPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="knowledge/:id" element={<KnowledgeArticlePage />} />
        <Route path="security" element={<VideosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
