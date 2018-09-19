/* eslint-disable import/default */

import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './containers/App';
import configureStore from './store/configureStore';
import './styles/index.scss';

const store = configureStore();

render (
  <AppContainer>
    <App store={store} />
  </AppContainer>,
  document.getElementById('chatApp')
);

// if (module.hot) {
//   module.hot.accept('./containers/App', () => {
//     const NewRoot = require('./containers/App').default;
//     render(
//       <AppContainer>
//         <NewRoot store={store} history={history} />
//       </AppContainer>,
//       document.getElementById('app')
//     );
//   });
// }
