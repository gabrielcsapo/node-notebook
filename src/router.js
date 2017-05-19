import React from 'react';
import { Router, Route, browserHistory } from 'react-router';

import Layout from './components/layout';
import Main from './main';
import Notebook from './notebook';

export default (
  <Router history={browserHistory}>
    <Route component={Layout}>
      <Route path="/" component={Main} />
      <Route path="/notebook" component={Notebook} />
      <Route path="/notebook/:hash" component={Notebook} />
    </Route>
  </Router>
);
