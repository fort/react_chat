import * as actionType from '../constants/actionTypes';

export default function talkHistoryReducer(state = {}, action) {
  const jid = action.jid;
  const data = action.data;
  const position = action.position;

  let newState, prevHistory = [];

  switch (action.type) {
    case actionType.REMOVE_JID_HISTORY:{
      newState = JSON.parse(JSON.stringify(state));
      if( newState.hasOwnProperty(jid) ){
        delete newState[jid];
      }
      return newState;
    }
    case actionType.SET_DELAYED_MESSAGES:{
      // console.log(state);
      // console.log(data);
      return state;
    }
    case actionType.SET_TALK_HISTORY:

      newState = JSON.parse(JSON.stringify(state));
      if( newState.hasOwnProperty(jid) ){
        prevHistory = newState[jid];
      }

      switch (position) {
        case 'prepend':{
          let newHistory = data.concat(prevHistory);
          newState[jid] = newHistory;
          break;
        }
        case 'append':{
          let newHistory = prevHistory.concat(data);
          newState[jid] = newHistory;
          break;
        }
        default:{
          newState[jid] = data;
          break;
        }
      }

      return newState;

      // return {
      //   ...state,
      //   [action.jid]: action.data
      // };

    case actionType.SEND_MESSAGE:
    case actionType.RECEIVE_MESSAGE:
      if (typeof state[action.jid] === 'undefined') {
        return {
          ...state,
          [action.jid]: [action.data]
        };
      }
      return {
        ...state,
        [action.jid]: [
          ...state[action.jid],
          action.data
        ]
      };

    default:
      return state;
  }
}
