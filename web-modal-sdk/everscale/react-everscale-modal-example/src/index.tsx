import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClientConfig } from '@eversdk/core';
import { TON_ENDPOINT, TonClientContextProvider } from './context/tonclient';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

//Look at the TonClient initialization documentation for Configure EeverSDK.md file

const config: ClientConfig = {
  network: {
    endpoints: [TON_ENDPOINT]
  }
}

root.render(
  <React.StrictMode>
    <TonClientContextProvider config={config}>
      <App />
    </TonClientContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
