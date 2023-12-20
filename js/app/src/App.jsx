import { useState } from 'react'
import {
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom'
import { Buffer } from 'buffer';
import { AppContext } from '../context'
import { ThemeProvider } from '@mui/material';
import { DEFAULT_THEME } from './utils/constants';
import { SwapHome } from './components/SwapHome';
import './App.css';
import './index.css';

if(typeof window !== 'undefined') {
  (window).Buffer = Buffer;
}

function App () {
  const [context, setContext] = useState({})

  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <AppContext.Provider value={{ context, setContext }}>
        <Router>
          <Routes>
            <Route path='' element={<SwapHome />} />
          </Routes>
        </Router>
      </AppContext.Provider>
    </ThemeProvider>
  )
}

export default App
