import * as actionType from '../constants/actionTypes';

export default function talkWindowReducer(state = {}, action) {
  let newState = JSON.parse(JSON.stringify(state));
  let eventVal;
  const jid = action.jid;
  const data = action.data;
  //
  switch (action.type) {
    case actionType.REMOVE_JID_TALK_WINDOW:{
      newState = JSON.parse(JSON.stringify(state));
      if( newState.hasOwnProperty(jid) ){
        delete newState[jid];
      }
      return newState;
    }
    case actionType.OPEN_TALK_WINDOW:
      return {
        ...state,
        [jid]: {
          close: false,
          expand: false,
          minimize: false,
          active: true,
          position: {x: 0, y: 0},
        }
      };

    case actionType.CONTROL_TALK_WINDOW:
      eventVal = newState[jid][data.event];
      //
      switch (data.event) {
        case 'position':
          newState[jid][data.event] = data.coordinates;
          break;
        case 'active':
          Object.keys(newState).map(key => newState[key][data.event] = false);
          newState[jid][data.event] = true;
          break;
        default:
          newState[jid][data.event] = !eventVal;
          break;
      }
      return newState;

    default:
      return state;
  }
}











