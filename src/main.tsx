
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { configureAmplify } from './lib/amplify'

// Configure Amplify (region pinned to us-east-1)
configureAmplify()
createRoot(document.getElementById("root")!).render(<App />);
