import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Analytics } from '@vercel/analytics/react';

// Import Framer Motion for animations
import { AnimatePresence } from 'framer-motion';

// Mount the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
    <Analytics />
  </StrictMode>
);