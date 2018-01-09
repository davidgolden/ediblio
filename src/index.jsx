import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';

require('./stylesheets/base.scss');
require('./stylesheets/grid.scss');


ReactDOM.render(
  <App />,
  document.getElementById('app')
);
