import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/chatActions';
import ContactsListItem from '../components/ContactsListItem';


class ContactsListContainer extends React.Component {
  constructor (props) {
    super(props);
  }

  _onContactClickHandler (jid) {
    this.props.actions.openTalkWindow(jid);
  }

  render() {
    let contactsArr = [];
    let contactsList = this.props.contacts;
    for(let key in contactsList) {
      let item = contactsList[key];
      //
      contactsArr.push(
        <ContactsListItem
          key={key}
          jid={item.jid}
          name={item.name}
          status={item.status}
          unread={item.unread}
          onItemClick={this._onContactClickHandler.bind(this)}
        />
      );
    }
    return (
      <div className="x2chatContactsBox">
        {contactsArr}
      </div>
    );
  }
}

ContactsListContainer.propTypes = {
  contacts: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    contacts: state.contactsList,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
};

export default connect (
  mapStateToProps,
  mapDispatchToProps
)(ContactsListContainer);
