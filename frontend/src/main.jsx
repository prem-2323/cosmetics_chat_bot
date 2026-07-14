import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'
import './i18n'

// Set the API base URL. During local development, it falls back to empty string
// to use the Vite dev server proxy. In production, it uses the VITE_API_URL environment variable.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

