import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectEditor from './pages/admin/ProjectEditor';
import AboutEditor from './pages/admin/AboutEditor';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
function App() {

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:slug" element={<ProjectPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/projects/new" element={
            <ProtectedAdminRoute>
              <ProjectEditor />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/projects/:id/edit" element={
            <ProtectedAdminRoute>
              <ProjectEditor />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/about/edit" element={
            <ProtectedAdminRoute>
              <AboutEditor />
            </ProtectedAdminRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;