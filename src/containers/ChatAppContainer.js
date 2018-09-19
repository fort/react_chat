import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/chatActions';
import ChatApp from '../components/ChatApp';

class ChatAppContainer extends React.Component {
  constructor(props) {
    super(props);
    // init chat
    props.actions.connectChat();
  }

  handleWindowClose(ev){
    ev.preventDefault();
    this.props,actions.disconnect();
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleWindowClose, false);
  }

  componentWillUnmount() {
    window.removeEventListener('onbeforeunload', this.handleWindowClose);
  }

  render () {
    if (!this.props.chatState.chatConnection) {
      return (
        <div style={{textAlign: 'center'}}> {this.props.chatState.message} </div>
      );
    }
    //
    return (
      <ChatApp {...this.props} />
    );
  }
}

ChatAppContainer.propTypes = {
  chatState: PropTypes.object,
  history: PropTypes.object,
  contacts: PropTypes.object,
  actions: PropTypes.object,
  windows: PropTypes.object,
  delayedAM: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    chatState: state.chatState,
    history: state.talkHistory,
    contacts: state.contactsList,
    windows: state.talkWindow,
    delayedAM : state.delayedAM
  };
};

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatAppContainer);
