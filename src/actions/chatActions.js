import * as types from '../constants/actionTypes';
import XmppApi from '../api/XmppApi';
import Entities from 'html-entities';

export function disconnect(){
  XmppApi.disconnect();
}
// connect chat and register server events handlers
export function connectChat () {
  let initContactList = true;
  return function (dispatch, getState) {
    XmppApi.connect(function (status) {

      let conState = {
        chatConnection: false,
        message: '',
        stropheConStatus: '',
      };
      switch(status){
        case 1:{
          conState = {chatConnection: false, message: 'Connecting'};
          break;
        }
        case 3:{
          conState = {chatConnection: false, message: 'Authentication'}
        }
        case 5:
        case 8:{
          conState = {chatConnection: true, message: 'Connected'};
          break;
        };
        case 4:{
          conState = {chatConnection: false, message: 'Authentication failed'};
          break;
        };
        case 10:{
          conState = {chatConnection: false, message: 'Connection Time out'};
          break;
        }
        default:{
          conState = {chatConnection: false, message: 'Error connection'};
        }
      }
      conState.stropheConStatus = status;

      dispatch({
        type: types.START_CHAT_CONNECTION,
        payload: conState
      });

      //connected or attached
      if( status === 5 || status === 8 ){

        // register events from server
        XmppApi.registerHandler('presenceHandler', function (presenceObj) {
          dispatch(actionSetPresence(presenceObj));
        });
        //
        XmppApi.registerHandler('receiveMessage', function (msgObj) {
          if( msgObj ){
            dispatch( asyncReceiveMessage(msgObj) );
            dispatch( updateUnreadMessagesPerContact(msgObj) );
          }
        });
        //
        XmppApi.registerHandler('contactsListHandler', function (contactsArray) {
          const { contactsList } = getState();
          if ( initContactList ) {
            // skip 'actionUpdateContactsList' if 'contactsList' was saved in localStorage before
            if ( Object.keys(contactsList).length === 0 ) {
              dispatch(actionUpdateContactsList(contactsArray));
            }else{
              let contactsObj = contactsArray.reduce((acc, cur) => {
                  acc[cur.jid] = cur;
                  acc[cur.jid]['unread'] = contactsList.hasOwnProperty(cur.jid) ? contactsList[cur.jid]['unread']: 0;
                  return acc;
                },
                {}
              );
              dispatch(actionInitContactsList(contactsObj));
            }
            // XmppApi.setPresence();
            initContactList = false;
          } else {
            dispatch(actionUpdateContactsList(contactsArray));
          }
        });

        //ping pong sequest-response
        XmppApi.registerHandler('ping_pong');

        XmppApi.setPresence();
      }

    });
  };
}

//1. Here we gets archive messages from jabber server IF talkHistory has not been loaded before and update TalkHistory State
function asyncReceiveMessage (newMessage) {
  return (dispatch, getState) => {
    const { talkHistory } = getState();
    const jid = newMessage.from;

    newMessage.body = new Entities.XmlEntities().encode( newMessage.body );

    let dm = {...newMessage};
    dm.jid = newMessage.from;
    dispatch({
      type:types.DELALYED_ARCHIEVE_MESSAGES_ADD,
      payload: dm
    });

    if ( talkHistory.hasOwnProperty(jid)) {
      dispatch(actionReceiveMessage(jid, newMessage));
    }
  };
}

function updateUnreadMessagesPerContact (data) {
  return (dispatch, getState) => {
    const { talkWindow } = getState();
    const jid = data.from;
    if ( talkWindow.hasOwnProperty(jid)) {
      if ( talkWindow[jid].close || talkWindow[jid].minimize  ) {
        dispatch(actionSetContactUnreadMessage(jid));
      }
    } else {
      dispatch(actionSetContactUnreadMessage(jid));
    }
  };
}

export function getPaginatedArchieveMessagesRecursively(jid, position='', cntMessages=0, cb){
  return function (dispatch) {
    dispatch( getPaginatedArchieveMessages(jid, (messages)=>{
      if (typeof cb === 'function') {
        cb(messages);
      }

      dispatch(actionSetTalkHistory(jid, messages, position));
      cntMessages += messages.length;
      if( cntMessages < 8 ){
        dispatch( getPaginatedArchieveMessagesRecursively(jid, 'prepend', cntMessages, cb) );
      }
    }));
  };
}

export function loadArchieveMessagesOnTalkHistoryComponentDidMount(jid){
  return function (dispatch) {
    new Promise((resolve) => {
      dispatch( getPaginatedArchieveMessagesRecursively( jid, 'prepend', 0, (messages)=>{
        resolve(messages);
        // dispatch(actionSetTalkHistory(jid, messages, 'prepend'));
      }));
    }).then(() => {
      dispatch( actionAppendDelayedMessageToTolkHistory(jid) );
    });
  };
}

//1. Here we gets archive messages from jabber server IF talkHistory has not been loaded before and update TalkHistory State
//2. Set clear unread messages notification per ContactListItem
export function openTalkWindow (jid) {
  return function (dispatch) {
    dispatch(actionOpenTalkWindow(jid));
    dispatch( actionControlTalkWindow(jid, {'event':'active'}) );

    dispatch(actionUnsetContactUnreadMessage(jid));
  };
}

function actionAppendDelayedMessageToTolkHistory(jid){
  return function (dispatch, getState) {
    let { talkHistory, delayedAM  } = getState();

    if( delayedAM.hasOwnProperty(jid) && !talkHistory.hasOwnProperty(jid) ){
      //append to talkHistory
      dispatch(actionSetTalkHistory(jid, delayedAM[jid]));
    }else if( delayedAM.hasOwnProperty(jid) && talkHistory.hasOwnProperty(jid) ){
      let copyJidTalkHistory = [...talkHistory[jid] ];

      let lastJidHistoryMessage = false;
      let appendDelayMessages    = false;

      if( copyJidTalkHistory.length > 0 ){
        lastJidHistoryMessage = copyJidTalkHistory.pop();
      }

      if( lastJidHistoryMessage ){
          appendDelayMessages = delayedAM[jid].filter( el => {
          if( el.unixTimeMs > lastJidHistoryMessage.unixTimeMs ){
            return el;
          }
        });

        if( Object.size(appendDelayMessages) > 0  ){
          //append to talkHistory
          dispatch(actionSetTalkHistory(jid, appendDelayMessages, 'append' ));
        }
      }
    }//else if
  };
}

export function actionScrollHistory(jid) {
  return function (dispatch) {
    // dispatch( getPaginatedArchieveMessagesRecursively(jid, 'prepend') );

    dispatch( getPaginatedArchieveMessages(jid, (messages)=>{
      dispatch(actionSetTalkHistory(jid, messages, 'prepend'));
    }));

  };
}

function getPaginatedArchieveMessages(jid, cb=''){
  return function (dispatch, getState) {
    const { messagePaginator } = getState();

    let collectionFirstId = '', collectionLastId = '', messageFirstId = '';
    let collectionsScrollIndex = '', collectionsScrollCount = '';

    if( messagePaginator.hasOwnProperty(jid) ){
      collectionFirstId = messagePaginator[jid].scrolling.collections.first;
      collectionLastId = messagePaginator[jid].scrolling.collections.last;
      messageFirstId = messagePaginator[jid].scrolling.messages.first;

      collectionsScrollIndex = messagePaginator[jid].scrolling.collections.index;
      collectionsScrollCount = messagePaginator[jid].scrolling.collections.count;
    }

    //last item in the history
    if( 0 == collectionsScrollIndex && collectionsScrollCount > 0  ){
      return false;
    }

    XmppApi.getArchivedCollections(jid, collectionFirstId, (collection, collResponseRsm)=> {
      XmppApi.getMessages(collection[0], messageFirstId, (messages, messResponseRsm)=>{
        // update pagin information
        let responseRsm = {};

        if( 0 == messResponseRsm.index ){
          responseRsm['messages'] = {
            index: 0,
            first:'',
            last:'',
            count: 0,
          };
          responseRsm['collections'] = {
            index: collResponseRsm.index,
            first: collResponseRsm.first,
            last:  collResponseRsm.last,
            count: collResponseRsm.count,
          };
        }else{
          responseRsm['messages']= {
            index: messResponseRsm.index,
            first: messResponseRsm.first,
            last:  messResponseRsm.last,
            count: messResponseRsm.count,
          };
          responseRsm['collections'] = {
            index: collectionsScrollIndex,
            first: collectionFirstId,
            last:  collectionLastId,
            count: collectionsScrollCount,
          };
        }

        dispatch(actionSaveMessageScrolling(jid, responseRsm));

        if (typeof cb === 'function') {
          cb(messages);
        }

      });
    });

  };
}

function actionSaveMessageScrolling(jid, rsm={}){
  return {
    type: types.MESSAGES_SCROLLING_HISTORY,
    jid: jid,
    data : rsm
  };
}

function actionSetPresence (presenceObj) {
  return {
    type: types.SET_CONTACT_PRESENCE,
    data: presenceObj
  };
}

function actionUpdateContactsList (contacts) {
  let contactsObj = contacts;
  if( contacts instanceof Array ){
    // convert to object of objects
    contactsObj = contacts.reduce((acc, cur) => {acc[cur.jid] = cur; return acc;}, {});
  }
  return {
    type: types.UPDATE_CONTACTS_LIST,
    data: contactsObj
  };
}

function actionInitContactsList (contacts) {
  let contactsObj = contacts;
  if( contacts instanceof Array ){
    // convert to object of objects
    contactsObj = contacts.reduce((acc, cur) => {acc[cur.jid] = cur; return acc;}, {});
  }
  return {
    type: types.INIT_CONTACTS_LIST,
    data: contactsObj
  };
}

export function actionSendMessage (msgObj) {
  return function (dispatch) {

    XmppApi.sendMessage(msgObj, (data) => {
      data.body = new Entities.XmlEntities().encode( data.body );

      dispatch({
        type: types.SEND_MESSAGE,
        data: data,
        jid: data.to,
      });

      //save sent message to delay state
      let dm = {...data};
      dm.jid = data.to;
      dispatch({
        type:types.DELALYED_ARCHIEVE_MESSAGES_ADD,
        payload: dm
      });
    });

  };
}

// action object generators
function actionReceiveMessage (jId, data) {
  return function (dispatch) {
    dispatch({
      type: types.RECEIVE_MESSAGE,
      jid: jId,
      data: data,
    });
  };
}

function actionSetTalkHistory (jid, data, position='') {
  return {
    type: types.SET_TALK_HISTORY,
    jid: jid,
    data: data,
    position:position,
  };
}

function actionSetContactUnreadMessage (jid) {
  return {
    type: types.SET_CONTACT_UNREAD_MESSAGE,
    jid: jid,
  };
}

function actionUnsetContactUnreadMessage (jid) {
  return {
    type: types.UNSET_CONTACT_UNREAD_MESSAGE,
    jid: jid,
  };
}

function actionOpenTalkWindow (jid, data={}) {
  return {
    type: types.OPEN_TALK_WINDOW,
    jid: jid,
    data: data,
  };
}

export function actionControlTalkWindow (jid, data) {
  return function (dispatch) {

    switch (data.event) {
      case 'close':{
        //remove TalkHistory, massagePaginator, TalkWindow
        dispatch( removeJidHistory(jid) );
        dispatch( removeJidScrollingHistory(jid) );
        dispatch( removeJidTalkWindow(jid) );
        break;
      }
      default:{
        dispatch({
          type: types.CONTROL_TALK_WINDOW,
          jid: jid,
          data: data,
        });
      }
    }

  };
}

function removeJidHistory(jid){
  return function (dispatch) {
    dispatch({
      type:types.REMOVE_JID_HISTORY,
      jid: jid
    });
  };
}

function removeJidScrollingHistory(jid){
  return function (dispatch){
    dispatch({
      type:types.REMOVE_JID_SCROLLING_HISTORY,
      jid: jid
    });
  };
}

function removeJidTalkWindow(jid){
  return function (dispatch){
    dispatch({
      type:types.REMOVE_JID_TALK_WINDOW,
      jid: jid
    });
  };
}




