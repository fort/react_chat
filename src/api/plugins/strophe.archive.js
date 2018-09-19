import {Strophe, $iq} from 'strophe.js';
import pluginStropheRSM from './strophe.rsm';
import moment from 'moment';

// http://xmpp.org/extensions/xep-0136.html
export default function pluginStropheArchive () {
  // init RMS Plugin
  pluginStropheRSM();
  //
  Strophe.addConnectionPlugin('archive', {
  _connection: null,

  init: function(connection) {
    this._connection = connection;
    Strophe.addNamespace('DELAY', 'jabber:x:delay');
    Strophe.addNamespace('ARCHIVE', 'urn:xmpp:archive');
  },

  listCollections: function(jid, rsm, callback) {
    let xml = $iq({type: 'get', id: this._connection.getUniqueId('list')}).c('list', {xmlns: Strophe.NS.ARCHIVE, 'with': jid});
    if (rsm) { xml = xml.cnode(rsm.toXML()); }
    this._connection.sendIQ(xml, this._handleListConnectionResponse.bind(this, callback));
  },

  _handleListConnectionResponse: function(callback, stanza) {
    let collections = [];
    let chats = stanza.getElementsByTagName('chat');
    for (let ii = 0; ii < chats.length; ii++) {
      let jid = chats[ii].getAttribute('with');
      let start = chats[ii].getAttribute('start');
      collections.push(new Strophe.ArchivedCollection(this._connection, jid, start));
    }
    let responseRsm = new Strophe.RSM({xml: stanza.getElementsByTagName('set')[0]});
    callback(collections, responseRsm);
  }
});

Strophe.ArchivedCollection = function(connection, jid, start) {
  this.connection = connection;
  this.jid = jid;
  this.start = start;
  this.startDate = new Date(start);
};

Strophe.ArchivedCollection.prototype = {
  retrieveMessages: function(rsm, callback) {
    let builder = $iq({type: 'get', id: this.connection.getUniqueId('retrieve')}).c('retrieve', {xmlns: Strophe.NS.ARCHIVE, 'with': this.jid, start: this.start});
    if (rsm) { builder = builder.cnode(rsm.toXML()); }
    this.connection.sendIQ(builder, function(stanza) {
      let messages = [];
      let myJid = Strophe.getBareJidFromJid(this.connection.jid);
      let responseRsm;
      let chat = stanza.getElementsByTagName('chat')[0];
      let element = chat.firstChild;
      let prevTimeStamp = this.startDate;

      let unixTimeMs = moment().valueOf();

      while (element) {
        if( element.getElementsByTagName('unixTimeMs').length ){
          unixTimeMs = Strophe.getText(element.getElementsByTagName('unixTimeMs')[0]);
        }
        switch (element.tagName) {
        case 'to':
          prevTimeStamp = this._incrementTimestampForMessage(prevTimeStamp, element);
          messages.push(new Strophe.ArchivedMessage(prevTimeStamp, myJid, this.jid, Strophe.getText(element.getElementsByTagName('body')[0]), unixTimeMs));
          break;
        case 'from':
          prevTimeStamp = this._incrementTimestampForMessage(prevTimeStamp, element);
          messages.push(new Strophe.ArchivedMessage(prevTimeStamp, this.jid, myJid, Strophe.getText(element.getElementsByTagName('body')[0]), unixTimeMs));
          break;
        case 'set':
          responseRsm = new Strophe.RSM({xml: element});
          break;
        default:
          break;
        }
        element = element.nextSibling;
      }
      callback(messages, responseRsm);
    }.bind(this));
  },

  _incrementTimestampForMessage: function(timestamp, element) {
    let secs = element.getAttribute('secs');
    let newTimestamp = new Date();
    newTimestamp.setTime(timestamp.getTime() + Number(secs) * 1000);
    return newTimestamp;
  }
};

Strophe.ArchivedMessage = function(timestamp, from, to, body, unixTimeMs) {
  this.timestamp = timestamp.toISOString();
  this.from = from;
  this.to = to;
  this.body = body;
  this.unixTimeMs = unixTimeMs;
};

Strophe.ArchivedMessage.prototype = {
};
}
