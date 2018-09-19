import * as actionType from '../constants/actionTypes';

export default function contactsListReducer (state = {}, action) {
  let newState = {...state};
  let data = action.data;
  //
  switch (action.type) {
    case actionType.UPDATE_CONTACTS_LIST:
      if (Object.keys(state).length !== 0) {
        for (let key in data) {
          if (data[key].subscription === 'remove') {
            delete newState[key];
            continue;
          }
          newState[key] = data[key];
        }

        return newState;
      } else {
        return data;
      }

    case actionType.INIT_CONTACTS_LIST:
      return {
        ...data
      };

    case actionType.SET_CONTACT_UNREAD_MESSAGE:
      if( state.hasOwnProperty(action.jid) ){
        return {
          ...state,
          [action.jid]:{
            ...state[action.jid],
            unread: state[action.jid].unread + 1
          }
        };
      }else{
        return state;
      }

    case actionType.UNSET_CONTACT_UNREAD_MESSAGE:
      if( state.hasOwnProperty(action.jid) ){
        return {
          ...state,
          [action.jid]:{
            ...state[action.jid],
            unread: 0
          }
        };
      }else{
        return state;
      }


    case actionType.SET_CONTACT_PRESENCE:
      if( state.hasOwnProperty(data.jid) ){
        return {
          ...state,
          [data.jid]:{
            ...state[data.jid],
            status: data.status
          }
        };
      }else{
        return state;
      }
    default:
      return state;
  }
}

