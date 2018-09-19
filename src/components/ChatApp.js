import React from 'react';
import PropTypes from 'prop-types';
import ContactsListContainer from '../containers/ContactsListContainer';
import TalkWindowsList from './TalkWindowsList';

class ChatApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let windows = this.props.windows;
    let history = this.props.history;
    let contacts = this.props.contacts;
    let actions = this.props.actions;
    let delayedAM = this.props.delayedAM;
    //
    return (
      <div className="x2chat">
        <ContactsListContainer />
        <TalkWindowsList
          actions={actions}
          contacts={contacts}
          history={history}
          windows={windows}
          delayedAM={delayedAM}
        />
      </div>
    );
  }
}

ChatApp.propTypes = {
  chatState: PropTypes.object,
  history: PropTypes.object,
  contacts: PropTypes.object,
  windows: PropTypes.object,
  delayedAM: PropTypes.object,
  actions: PropTypes.object,
};

export default ChatApp;
