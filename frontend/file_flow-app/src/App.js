import React from 'react'
import AppRouter from './components/AppRouter';
import { BrowserRouter } from 'react-router-dom';
import './App.css'

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="App">
          <header className="App-header">
            <AppRouter />
          </header>
        </div>
      </BrowserRouter>
    </div>
  );
}
