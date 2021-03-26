import { combineReducers } from 'redux';

import { auth } from './auth/reducer'
import { contracts } from './contracts/reducer';
import { corpuses } from './corpuses/reducer';
import { labels } from './labels/reducer';
import { labelsets } from './labelset/reducer';
import { annotations } from './annotations/reducer';
import { relations } from './relations/reducer';
import { exports } from './exports/reducer';

const rootReducer = combineReducers({
  auth,
  contracts,
  corpuses,
  labels,
  labelsets,
  annotations,
  relations,
  exports
});

export default rootReducer;