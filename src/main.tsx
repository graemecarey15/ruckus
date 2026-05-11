import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initNative } from './native/capacitor';

initNative();
createRoot(document.getElementById('root')!).render(<App />);
