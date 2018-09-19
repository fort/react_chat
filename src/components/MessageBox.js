import React from 'react';
import PropTypes from 'prop-types';

export default class MessageBox extends React.Component {
  constructor (props) {
    super(props);
  }
  //
  componentDidUpdate () {
    if (this.props.isFocused) {
      this.setFocus();
    }
  }
  //
  setFocus () {
    this.messageBoxEl.focus();
  }
  _handleKeyPress (se) {
    const key = se.nativeEvent.key.toUpperCase();
    const message = se.target.innerText;
    //
    if (key === 'ENTER' && !se.shiftKey) {
      if (typeof this.props.onSendMessage === 'function') {
        se.preventDefault();
        if (message.trim().length !== 0) {
          this.props.onSendMessage(message, this.props.jid);
        }
        se.target.innerHTML = '';
      }
    }
  }
  //
  render () {
    return (
      <div className="x2chat--sendMsgBox">
        <div className="_box1">
          <i className="fa fa-lock" />
        </div>
        <div className="_box2">
          <div contentEditable placeholder="Type a message here" onKeyPress={this._handleKeyPress.bind(this)} ref={el => {this.messageBoxEl = el;}} />
        </div>
      </div>
    );
  }
}

MessageBox.propTypes = {
  jid: PropTypes.string,
  isFocused: PropTypes.bool,
  onSendMessage: PropTypes.func,
};

