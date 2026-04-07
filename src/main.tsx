import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RoleProvider } from './contexts/RoleContext.tsx';
import { FirebaseProvider } from './contexts/FirebaseContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </FirebaseProvider>
  </StrictMode>,
);
