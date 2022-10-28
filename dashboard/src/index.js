import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import Router from './Router';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <MantineProvider theme={{ colorScheme: 'dark', fontFamily: 'Inter', headings: { fontFamily: 'Inter' } }}> */}
        <Router />
      {/* </MantineProvider> */}
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
