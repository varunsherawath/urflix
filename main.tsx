import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('main.tsx loading...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found!</div>';
  throw new Error('Root element not found');
}

console.log('Root element found, rendering App...');

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering App:', error);
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px; background: black;">
      <h1>Error Loading App</h1>
      <pre>${String(error)}</pre>
    </div>
  `;
}

