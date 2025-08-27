import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <BrowserRouter> {/*to allow my app to use web browser components*/}
    <App />
    </BrowserRouter>
    
  </StrictMode>,
)


