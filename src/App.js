import React from 'react';
import { HashRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import SecretForm from './components/SecretForm';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Navbar />
        <div className="content">
          <SecretForm />
        </div>
      </div>
    </HashRouter>
  );
}

export default App; 