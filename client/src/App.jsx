import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PermissionsPage from './pages/PermissionsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { fetchMyProfile } from './features/auth/authSlice';
import PermissionRoute from './components/PermissionRoute';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';

function App() {
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state.auth);

  const [isCheckingAuth, setIsCheckingAuth] = useState(
    Boolean(token)
  );

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMyProfile()).finally(() => {
        setIsCheckingAuth(false);
      });
    } else {
      setIsCheckingAuth(false);
    }
  }, [dispatch, token, user]);

  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <LoginPage />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route element={<PermissionRoute permission="permissions:read" />}>
              <Route
                path="/permissions"
                element={<PermissionsPage />}
              />
            </Route>

            <Route element={<PermissionRoute permission="roles:read" />}>
              <Route
                path="/roles"
                element={<RolesPage />}
              />
            </Route>
            <Route element={<PermissionRoute permission="users:read" />}>
              <Route
                path="/users"
                element={<UsersPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={user ? '/dashboard' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;