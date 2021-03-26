import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './rootReducer';
import { createLogger } from 'redux-logger'

const loggerMiddleware = createLogger()

export default function configureStore(preloadedState) {
  
  return createStore(
    rootReducer,
    preloadedState,
    // loggerMiddleware,
    applyMiddleware(thunkMiddleware)
  )
}
