import { combineReducers } from 'redux';
import chatReducer from './chatReducer';
import talkHistoryReducer from './talkHistoryReducer';
import contactsListReducer from './contactsListReducer';
import talkWindowReducer from './talkWindowReducer';
import messagesPaginatorReducer from './messagesPaginatorReducer';
import delayedArchieveMessages from './delayedArchieveMessages';

const rootReducer = combineReducers({
  chatState: chatReducer,
  talkHistory: talkHistoryReducer,
  contactsList: contactsListReducer,
  talkWindow: talkWindowReducer,
  messagePaginator: messagesPaginatorReducer,
  delayedAM: delayedArchieveMessages,
});

export default rootReducer;
