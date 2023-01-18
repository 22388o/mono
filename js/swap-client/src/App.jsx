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
import { SwapManage } from './components/SwapManage';
import { store } from './store';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path='' element={<Swap />}>
            <Route path='' element={<SwapManage />} />
            <Route path='/swap' element={<SwapDemo />} />
            <Route path='/history' element={<SwapHistory />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
