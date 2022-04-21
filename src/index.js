import React from "react";
import ReactDOM from 'react-dom/client';
import App from './components/App.js';

//Crea el elemento root en el que renderizaremos App
//const element=React.createElement('h1',{className:'greeting'},'Hello World');
//ReactDOM.render(element,document.getElementById('root'))
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);