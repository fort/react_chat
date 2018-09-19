import * as actionType from '../constants/actionTypes';

//
export default function delayedArchieveMessages(state = {}, action) {
  //
  let payload = action.payload;
  switch (action.type) {
    case actionType.DELALYED_ARCHIEVE_MESSAGES_ADD: {

      if( !state.hasOwnProperty( payload.jid )  || !state[payload.jid].length ) {
        return {
          ...state,
          [payload.jid]: [payload]
        };
      }

      let newState = {
          ...state,
          [payload.jid]:[
          ...state[payload.jid], payload
        ]
      };

      let intervalTime = payload.unixTimeMs - (60 * 1000); // interval: 60 seconds
      let reducedMessages = newState[payload.jid].filter( el => {
        if( el.unixTimeMs >= intervalTime ){
          return el;
        }
      });

      return {
        ...state,
        [payload.jid]:reducedMessages
      };

    }

    default:
      return state;
  }
}
