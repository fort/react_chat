import React, { Component } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import ChatAppContainer from '../containers/ChatAppContainer';

// This is a class-based component because the current
// version of hot reloading won't hot reload a stateless
// component at the top-level.
export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <ChatAppContainer />
      </Provider>
    );
  }
}

App.propTypes = {
  store: PropTypes.object.isRequired
};
