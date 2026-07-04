/** Application entry — mounts the React root and global styles. */
import { StrictMode } from 'react';import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
