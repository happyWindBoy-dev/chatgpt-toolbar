import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import ChatgptPanel from './components/ChatgptPanel';
import Preference from './components/Preference';
import { useEffect, useState } from 'react';
import '@arco-design/web-react/dist/css/arco.css';

export default function App() {
  const [userConfig, setUserConfig] = useState();
  useEffect(() => {
    window.electronAPI.getUserConfig().then((res) => {
      setUserConfig(res);
    });

  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatgptPanel userConfig={userConfig} />} />
        <Route
          path="/preference"
          element={<Preference userConfig={userConfig} />}
        />
      </Routes>
    </Router>
  );
}
