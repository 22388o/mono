import { useState } from 'react'
import { Provider } from 'react-redux';
import { 
  Route, 
  BrowserRouter as Router, 
  Routes } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import './App.css'
import { Swap } from './components/Swap';
import { SwapDemo } from './components/SwapDemo';
import { SwapHistory } from './components/SwapHistory/SwapHistory';
import { SwapCreate } from './components/SwapCreate';
import { store } from './store';
import { SwapHome } from './components/SwapHome';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path='' element={<SwapHome />} />
          <Route path='' element={<Swap />}>
            <Route path='/swap' element={<SwapDemo />} />
            <Route path='/history' element={<SwapHistory />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
