import React from 'react';
import PropTypes from 'prop-types';

const ContactsListItem = (props) => {
  let status = props.status;
  let stausClass = (status !== 'offline') ? 'active' : '';
  let unreadBox = (props.unread > 0) ? <div className="mod--badge">{props.unread}</div> : '';
  //
  return (
    <div onClick={() => { props.onItemClick(props.jid); }} className="x2chatContact">
      <div>
        <div className="x2chatContactPic">
          <div className="x2chatContactPicIco">
            <i className="fa fa-user" />
          </div>
          <span className={'x2chatContactPicStatus ' + stausClass} />
        </div>
      </div>
      <div>
        <div className="x2chatContactInfo">
          <div className="_title">{props.name}</div>
          {unreadBox}
        </div>
      </div>
    </div>
  );
};

ContactsListItem.propTypes = {
  jid: PropTypes.string,
  unread: PropTypes.number,
  name: PropTypes.string,
  status: PropTypes.string,
  onItemClick: PropTypes.func
};

export default ContactsListItem;
