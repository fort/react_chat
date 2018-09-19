import React from 'react';
import PropTypes from 'prop-types';

const TalkWindowHeader = ({jid, contact, onWindowControl}) => {
  let unreadBox = (contact.unread > 0) ? <div className="mod--badge">{contact.unread}</div> : '';
  //
  return (
    <div className="x2chat--talkWindow--header _dragHandler">
      <div className="_box1">
        <div><i style={('online' === contact.status) ? {color: '#1EC659'} : null} className="fa fa-comment" /></div>
        <div>
          <div className="_name">{contact.name}</div>
        </div>
      </div>
      <div className="_box2">
        {unreadBox}
        <i onClick={() => {onWindowControl(jid, 'minimize');}} className="fa fa-sort-desc" title="Minimize window" />
        <i onClick={() => {onWindowControl(jid, 'expand');}} className="fa fa-expand" title="Expand window" />
        <i onClick={() => {onWindowControl(jid, 'close');}} className="fa fa-times" title="Colose window" />
      </div>
    </div>
  );
};

TalkWindowHeader.propTypes = {
  jid: PropTypes.string.isRequired,
  contact: PropTypes.object,
  onWindowControl: PropTypes.func.isRequired,
};

export default TalkWindowHeader;
