import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { SessionNotFoundPage } from './pages/SessionNotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/session/:sessionId',
    element: <SessionPage />,
  },
  {
    path: '/session-not-found',
    element: <SessionNotFoundPage />,
  },
  {
    path: '*',
    element: <HomePage />,
  },
]);
