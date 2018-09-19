import {Strophe, $iq, $msg, $pres} from 'strophe.js';
import pluginStropheArchive from './plugins/strophe.archive';
import {xmlToJson} from '../helpers';
import moment from 'moment';
//
class XmppApi {
  constructor () {
    this.connection = null;
    // add archive strophe support
    pluginStropheArchive();
  }

  disconnect() {
    this.connection.disconnect();
  }

  connect (cb) {
    clearTimeout(this.reconnectionTimeout);

    if (process.env.NODE_ENV === 'development') {
      let jid = 'client@localhost/x2crm';
      // let jid = 'ban@localhost/x2crm';
      // let jid = 'admin@localhost/x2crm';
      let pass = 'pass';
      let serverURL = 'ws://127.0.0.1:7070/ws/';

      this.connection = new Strophe.Connection(serverURL);
      this.connection.connect(jid, pass, (status) => {
        cb(status, this.connection);

        if (status === Strophe.Status.DISCONNECTED) {
          clearTimeout(this.reconnectionTimeout);
          this.reconnectionTimeout = setTimeout( ()=>{ this.connect(cb); },3000 );
        }
      });
    } else {

      let {JID='', SID, RID, BOSH_URL='', PASS =''} = window.x2.x2ChatManager.setting;
      this.connection = new Strophe.Connection(BOSH_URL);

      this.connection.connect(JID, PASS, (status) => {
        cb(status, this.connection);

        if (status === Strophe.Status.DISCONNECTED) {
          clearTimeout(this.reconnectionTimeout);
          this.reconnectionTimeout = setTimeout( ()=>{ this.connect(cb) },3000 );
        }
      });

      /*
      if( !BOSH_URL.search(/^http[s]?:\/\//)){
        this.connection.attach(JID, SID, RID, (status) => {
          cb(status, this.connection);

          if (status === Strophe.Status.DISCONNECTED) {
            clearTimeout(this.reconnectionTimeout);
            this.reconnectionTimeout = setTimeout( ()=>{ this.connect(cb); },3000 );
          }
        });
      }

      if( !BOSH_URL.search(/^ws:\/\//) ){
        this.connection.connect(JID, PASS, (status) => {
          cb(status, this.connection);

          if (status === Strophe.Status.DISCONNECTED) {
            clearTimeout(this.reconnectionTimeout);
            this.reconnectionTimeout = setTimeout( ()=>{ this.connect(cb) },3000 );
          }
        });
      }
      */

    }
    //
    return this.connection;
  }

  setPresence () {
    this.connection.send($pres());
  }

  registerHandler(name, handler) {
    switch (name) {
      case 'receiveMessage':
        this.connection.addHandler(data => {
          handler(this._prepareReceivedMessageObj(data));
          return true;
        }, null, 'message');
      break;

      case 'presenceHandler':
        this.connection.addHandler(data => {
          handler(this._preparePresenceObj(data));
          return true;
        }, null, 'presence');
      break;

      case 'contactsListHandler':
        this.connection.addHandler(data => {
          handler(this._prepareContactListObj(data));
          return true;
        }, 'jabber:iq:roster', 'iq');
        // get roster on init
        this.connection.send(
          $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'})
        );
      break;

      case 'ping_pong':
        this.connection.addHandler(ping => {
          let pingId = ping.getAttribute('id');
          let from = ping.getAttribute('from');
          let to = ping.getAttribute('to');
          let pong = $iq({type:'result', to:from, id: pingId, from: to });
          this.connection.send(pong);
        }, 'urn:xmpp:ping', 'it', 'get');
        break;

      default:
        handler(false);
      break;
    }
  }

  sendMessage (data, cb) {
    let type = 'chat'; // chat, error, normal(default), groupchat, or headline
    data.unixTimeMs = moment().valueOf();
    let msg = $msg({to: data.to, type: type}).c('body').t(data.body).up().c('unixTimeMs').t( data.unixTimeMs );

    data.from = Strophe.getBareJidFromJid(this.connection.jid);
    this.connection.send(msg);
    cb(this._generateMessageObj(data));
  }

  _prepareReceivedMessageObj (stanza) {
    let stnzObj = xmlToJson(stanza);
    if ( !stnzObj.hasOwnProperty('body')) {
      return false;
    }
    let attr = stnzObj['@attributes'];
    let body = stnzObj.body['#text'];

    let unixTimeMs = moment.valueOf();
    if( stnzObj.hasOwnProperty('unixTimeMs') ){
      unixTimeMs = stnzObj.unixTimeMs['#text'];
    }
    let jidNode = Strophe.getBareJidFromJid(attr.from);
    let type = attr.type; // chat, error, normal, groupchat, or headline

    return this._generateMessageObj({
      id: attr.id,
      from: jidNode,
      to: attr.to,
      type: type,
      body: body,
      unixTimeMs: unixTimeMs,
    });

  }

  getArchivedCollections(jid, before='', cb){
    let rsm = new Strophe.RSM({ 'before': before, 'max':'1' });
    this.connection.archive.listCollections(jid, rsm, (collections, responseRsm) => {
      cb(collections, responseRsm);
    });
  }

  getMessages(collection, before='', cb){
    let rsm = new Strophe.RSM({ 'before': before, 'max':8 });
    let newArr = [];

    collection.retrieveMessages(rsm, (messages, responseRsm) => {
      //Here proceed with list of messages
      messages.map((el, ii) => {
        let newMsg = {
          id: moment(el.timestamp).format('X') + ii,
          from: el.from,
          to: el.to,
          body: el.body,
          time: el.timestamp,
          unixTimeMs: el.unixTimeMs
        };
        //
        newArr.push(this._generateMessageObj(newMsg));
      });

      cb(newArr, responseRsm);
    });
  }

  getArchivedMessages (jid = '', cb) {
    let newArr = [];
    this.connection.archive.listCollections(jid, new Strophe.RSM({ max: 1000 }), (collections) => {
      let rsm = new Strophe.RSM({ 'before': '' });
      //
      new Promise((resolve) => {
        for (let i = 0; i < collections.length; i++) {
          collections[i].retrieveMessages(rsm, (messages) => {
            //Here proceed with list of messages
            messages.map((el, ii) => {
              let newMsg = {
                id: moment(el.timestamp).format('X') + ii,
                from: el.from,
                to: el.to,
                body: el.body,
                time: el.timestamp
              };
              //
              newArr.push(this._generateMessageObj(newMsg));
            });
            if (collections.length - 1 == i) {
              resolve();
            }
          });
        }
      })
        .then(() => {
          cb(newArr);
        });
    });
  }

  // make uni fromated message object
  _generateMessageObj (data) {
    let id = data.id || moment().format('x');
    let from = data.from || '';
    let to = data.to || '';
    let type = data.type || 'chat'; // chat, error, normal, groupchat, or headline
    let body = data.body || '';
    let time = data.time || moment().valueOf();
    let unixTimeMs = ( data.hasOwnProperty('unixTimeMs') ? data.unixTimeMs : moment().valueOf() );
    let name = Strophe.getNodeFromJid(from);
    //
    return {
      id: id,
      from: from,
      name : name,
      to: to,
      type: type,
      body: body,
      time:  time,
      unixTimeMs: unixTimeMs,
    };
  }

  _preparePresenceObj (stanza) {
    let status = 'online';
    let stnzObj = xmlToJson(stanza);
    let attr = stnzObj['@attributes'];
    //
    switch (attr.type) {
      case 'unavailable':
        status = 'offline';
        break;
      case 'error':
        throw new Error('XmppApi:_preparePresenceObj()');
    }
    //
    return {
      jid: Strophe.getBareJidFromJid(attr.from),
      status: status,
      time: moment().toISOString(),
    };
  }

  _prepareContactListObj (stanza) {
    let items;
    let mainObj = xmlToJson(stanza);
    let iqItem = mainObj.query.item;
    //
    if ( Array.isArray(iqItem) ) {
      items = iqItem;
    } else {
      items = [iqItem];
    }
    //
    return items.map(item => {
      let attr = item['@attributes'];
      let group = (item.group) ? item.group['#text'] : '';
      let subscription = ('remove' === attr.subscription) ? 'remove' : 'add';
      //
      return {
        jid: attr.jid,
        name: attr.name || '',
        subscription: subscription,
        status: 'offline',
        unread : 0,
        statusTime: '',
        group: group
      };
    });
  }
}

export default ( new XmppApi() );
