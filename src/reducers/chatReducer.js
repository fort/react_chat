import * as actionType from '../constants/actionTypes';

// IMPORTANT: Note that with Redux, state should NEVER be changed.
// State is considered immutable. Instead,
// create a copy of the state passed and set new values on the copy.
// Note that I'm using Object.assign to create a copy of current state
// and update values on the copy.
//
const initialState = {
  chatConnection: false,
  message : '',
  stropheConStatus: '',
}
export default function chatReducer(state = initialState, action) {
  //
  switch (action.type) {
    case actionType.START_CHAT_CONNECTION:
      return {
        ...state, ...action.payload
      };

    default:
      return state;
  }
}
