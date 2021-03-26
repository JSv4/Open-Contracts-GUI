import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import configureStore from './redux/configureStore';
import { Auth0Provider } from "@auth0/auth0-react";

// Usage Analytics Code
import { v4 as uuidv4 } from 'uuid';
import ReactGA from 'react-ga';

import history from "./utils/history";
import App from './App';

let {
  REACT_APP_AUTH0_CLIENTID,
  REACT_APP_AUTH0_AUDIENCE,
  REACT_APP_AUTH0_DOMAIN,
  REACT_APP_AUTH0_SCOPE,
  REACT_APP_GOOGLE_TRACKING_ID,
  REACT_APP_AUTH0_API_AUDIENCE
} = process.env;


ReactGA.initialize(REACT_APP_GOOGLE_TRACKING_ID);
ReactGA.pageview(window.location.pathname + window.location.search);

const store = configureStore();

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

ReactDOM.render(
  <Provider store={store}>
    
    <Auth0Provider
      domain={REACT_APP_AUTH0_DOMAIN}
      clientId={REACT_APP_AUTH0_CLIENTID}
      audience={REACT_APP_AUTH0_API_AUDIENCE}
      redirectUri={window.location.origin}
      scope="read:all"
      onRedirectCallback={onRedirectCallback}
    >
      <App/>
    </Auth0Provider>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
