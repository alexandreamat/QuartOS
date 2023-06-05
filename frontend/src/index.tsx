import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from './app/store';
import App from './App';
import ErrorBoundary from 'components/ErrorBoundary';

import 'semantic-ui-css/semantic.min.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  // <React.StrictMode>
  <ErrorBoundary fallback={<p>Something went wrong</p>}>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary >
  // </React.StrictMode>
);