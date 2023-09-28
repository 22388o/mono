import { useState } from 'react'
import {
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom'
import './App.css'
import { Swap } from './components/Swap'
import { SwapActivity } from './components/SwapActivity/SwapActivity'
import { SwapHome } from './components/SwapHome'
import { AppContext } from '../context'
import { ThemeProvider } from '@mui/material'
import { DEFAULT_THEME } from './utils/constants'

function App () {
  const [context, setContext] = useState({})

  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <AppContext.Provider value={{ context, setContext }}>
        <Router>
          <Routes>
            <Route path='' element={<SwapHome />} />
            <Route path='' element={<Swap />}>
              <Route path='/history' element={<SwapActivity />} />
            </Route>
          </Routes>
        </Router>
      </AppContext.Provider>
    </ThemeProvider>
  )
}

export default App
