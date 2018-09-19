import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Draggable from 'react-draggable';
import MessageBox from './MessageBox';
import TalkHistory from './TalkHistory';
import TalkWindowHeader from './TalkWindowHeader';
import moment from 'moment';

export default class TalkWindowsList extends React.Component {
  constructor(props) {
    super(props);
  }
  //
  _onSendMessageHandler(message, to) {
    this.props.actions.actionSendMessage({
      body: message,
      to: to,
      time: moment().toISOString(),
    });
  }

  _onWindowControlHandler (jid, event) {
    if ('minimize' == event && this.props.windows[jid].minimize) {
      this.props.actions.openTalkWindow(jid);
    } else {
      this.props.actions.actionControlTalkWindow(jid, {event});
    }
  }

  _onStopWindowMoveHandler (jid, coordinates) {
    this.props.actions.actionControlTalkWindow(jid, {
      event: 'position',
      coordinates
    });
  }
  //
  render() {
    let jidHistory;
    let dragableSettings;
    let renderWindows = [];
    let windows = this.props.windows;
    let contacts = this.props.contacts;
    let history = this.props.history;

    //
    for (let key in windows) {
      if (key) {
        const w = windows[key];
        const windowClassNames = classNames({
          'x2chat--talkWindow': true,
          '_isMinimized': w.minimize,
          '_isExpanded': w.expand && !w.minimize,
          '_isClosed': w.close,
          '_isActive': w.active,
        });
        // remove talk window if contact has removed
        if (typeof contacts[key] === 'undefined')
          continue;
        // get jid history
        if (typeof history[key] === 'undefined') {
          jidHistory = [];
        } else {
          jidHistory = history[key];
        }
        // setup dragable settings
        dragableSettings = {
          key,
          disabled: false,
          axis: 'both',
          handle: '._dragHandler',
          position: w.position,
          onStop: (e, data) => {this._onStopWindowMoveHandler(key, {x: data.x, y: data.y});},
        };
        if (w.minimize) {
          dragableSettings.axis = 'x';
          dragableSettings.position = {...w.position, y: 0};
        } else if (!w.minimize && dragableSettings.position.y == 0) {
          // dragableSettings.position = {x: 0, y: 0};
        }
        if (w.expand && !w.minimize) {
          dragableSettings.axis = 'none';
          dragableSettings.disabled = true;
          dragableSettings.position = {x: 0, y: 0};
        }
        //
        renderWindows.push(
          <Draggable {...dragableSettings} onMouseDown={() => {this._onWindowControlHandler(key, 'active');}}>
            <div className={windowClassNames}>
              <TalkWindowHeader jid={key} onWindowControl={this._onWindowControlHandler.bind(this)} contact={contacts[key]} />
              <TalkHistory actions={this.props.actions} jid={key} history={jidHistory} />
              <MessageBox jid={key} isFocused={w.active} onSendMessage={this._onSendMessageHandler.bind(this)} />
            </div>
          </Draggable>
        );
      }
    }
    //
    return (
      <div className="x2chat--talkWindowList">
        {renderWindows}
      </div>
    );
  }
}

TalkWindowsList.propTypes = {
  windows: PropTypes.object.isRequired,
  contacts: PropTypes.object.isRequired,
  history: PropTypes.object,
  actions: PropTypes.object.isRequired,
};
