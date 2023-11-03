//import logo from './logo.svg';
import './App.css';
import React from 'react';
import './App.css';
import ScrapingComponent from './ScrapingComponent';
import logo from './images/robot.png';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="Image-head">
        <img src={logo} alt="Logo" style={{ maxWidth: '100px', maxHeight: '100px', opacity: 0.5}} />
        </div>
        <p></p>
        <ScrapingComponent/>

    
        
      </header>
    </div>
  );
}

export default App;
