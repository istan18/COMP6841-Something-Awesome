import React, { useState, useEffect } from 'react';
import BACKEND_PORT from './config.json';

const App = () => {
  const [data, setData] = useState<string>('');

  useEffect(() => {
    fetch(`http://localhost:${BACKEND_PORT}/`)
      .then((response) => response.text())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{data}</p>
      </header>
    </div>
  );
};

export default App;
