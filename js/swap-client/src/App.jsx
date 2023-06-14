import { 
  Route, 
  BrowserRouter as Router, 
  Routes } from 'react-router-dom';
import './App.css'
import { Swap } from './components/Swap';
import { SwapActivity } from './components/SwapActivity/SwapActivity';
import { SwapHome } from './components/SwapHome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='' element={<SwapHome />} />
        <Route path='' element={<Swap />}>
          <Route path='/history' element={<SwapActivity />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
