import * as actionType from '../constants/actionTypes';

export default function messagesPaginatorReducer(state = {}, action) {
  const jid = action.jid;
  const data = action.data;
  let newState = [];
  //
  switch (action.type) {
    case actionType.REMOVE_JID_SCROLLING_HISTORY:{
      newState = JSON.parse(JSON.stringify(state));
      if( newState.hasOwnProperty(jid) ){
        delete newState[jid];
      }
      return newState;
    }
    case actionType.MESSAGES_SCROLLING_HISTORY:{
      let scrolling = {};

      scrolling = {
        collections:{
          index: data.collections.index,
          first: data.collections.first,
          last:data.collections.last,
          count: data.collections.count,
        },
        messages: {
          index: data.messages.index,
          first: data.messages.first,
          last:data.messages.last,
          count: data.messages.count,
        }
      };

      return {
        ...state,
        [jid]: {
          scrolling: scrolling,
        }
      };
    }
    default:{
      return state;
    }

  }
}











