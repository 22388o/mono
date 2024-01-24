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
import { Sdk } from '@portaldefi/sdk';

if(typeof window !== 'undefined') {
  (window).Buffer = Buffer;
}

function App () {
  const [context, setContext] = useState({})
  const url = new URL(window.location);
  const sdkProps = {
    id: 'alice',
    hostname: url.hostname,
    port: Number(url.port),
    pathname: '/api/v1'
  }
  const sdk = new Sdk(sdkProps)
    .on("log", (level, ...args) => console[level](...args))
    .on("error", (err, ...args) => console.error(err, ...args))
  sdk.start()

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
