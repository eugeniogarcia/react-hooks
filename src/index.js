import React from "react";
import ReactDOM from 'react-dom';
import App from './components/App.js';

//Crea el elemento root en el que renderizaremos App
const root = document.getElementById('root');
ReactDOM
  .unstable_createRoot(root)
  .render(<App />);