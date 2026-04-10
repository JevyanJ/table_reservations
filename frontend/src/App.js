
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ReservationsPage from './pages/ReservationsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ActivitiesPage from './pages/ActivitiesPage';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import { TokenProvider } from './context/TokenContext';
import { MeProvider } from './context/MeContext';
import { TablesProvider } from './context/TablesContext';
import { UsersProvider } from './context/UsersContext';
import { ActivitiesProvider } from './context/ActivitiesContext';
import './App.css';

function App () {
  return (
    <TokenProvider>
      <MeProvider>
        <TablesProvider>
          <UsersProvider>
            <ActivitiesProvider>
              <Router>
                <CssBaseline />
                <Sidebar />
                <Container
                  sx={{
                    p: 3,
                    ml: '220px',
                    mr: 0,
                    width: 'calc(100vw - 220px)',
                    minWidth: 'calc(100vw - 220px)',
                    maxWidth: 'calc(100vw - 220px)',
                    minHeight: '100vh',
                  }}
                >
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                      path="/reservas"
                      element={
                        <ProtectedRoute userOnly>
                          <ReservationsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/perfil"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/activities"
                      element={
                        <ProtectedRoute>
                          <ActivitiesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Container>
              </Router>
            </ActivitiesProvider>
          </UsersProvider>
        </TablesProvider>
      </MeProvider>
    </TokenProvider>
  );
}

export default App;
