// @flow
/* eslint import/no-webpack-loader-syntax: 0 */

import _ from 'lodash';
import React, { useState } from 'react';
import PDFWorker from "worker-loader!pdfjs-dist/lib/pdf.worker";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from 'react-redux';
import { setPdfWorker } from "react-pdf-highlighter";
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";
import {
  handleLoginSuccess,
  handleLoginFailure,
  handleLogout
} from './redux/auth/actions'

import { Container, Dimmer, Loader } from 'semantic-ui-react';
import { ToastContainer } from 'react-toastify';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// import {ProtectedRoute} from './components/auth/ProtectedRoute';
import {header_menu_items} from './configurations/menus';
import history from "./utils/history";
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Labels from './views/Labels';
import ExportModal from './components/exports/ExportModal';
import Documents from './views/Documents';
import Corpuses from './views/Corpuses';
import PrivacyPolicy from './views/PrivacyPolicy';
import TermsOfService from './views/TermsOfService';

// Usage Analytics Code
import { v4 as uuidv4 } from 'uuid';
import ReactGA from 'react-ga';
import { requestCorpuses } from './redux/corpuses/actions';
import { requestContracts } from './redux/contracts/actions';
import { requestLabelsets } from './redux/labelset/actions';

setPdfWorker(PDFWorker);

const App = () => {

  const { getAccessTokenSilently, user, loading, error } = useAuth0();
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [menu_selection, changeMenu] = useState('Home')
  const dispatch = useDispatch()
  
  if (user) {
    getAccessTokenSilently({
      audience: 'https//opensource.legal/contracts_api',
      scope: "read:all"
    }).then(token => {
      if (token) {
        dispatch(handleLoginSuccess({ user, token })).then(()=>{
          Promise.all([
              dispatch(requestCorpuses()),
              dispatch(requestContracts()),
              dispatch(requestLabelsets())
            ]).then(() => {
            ReactGA.set({
              userId: user.email,
              userName: user.name
            });
          });
        });
      }
      else {
        dispatch(handleLoginFailure());
      }
    });
  }
  else {
    dispatch(handleLogout());
    ReactGA.set({
      userId: `Anonymous-${uuidv4()}`,
      userName: `Anonymous-${uuidv4()}`
    })
  }

  const handleChangeMenu = (option) => {
    try{
      if (_.find(header_menu_items, ['title', option]).length===1) {
        changeMenu(option);
      }
    } catch {}
  }

  const handleToggleExportModal = () => {
    setExportModalVisible(!exportModalVisible);
  }

  return (
      <BrowserRouter history={history}>
        { exportModalVisible ? 
          <ExportModal
            visible={exportModalVisible}
            toggleModal={handleToggleExportModal}
          /> : <></> 
        }
        <ToastContainer />
        <Header 
          selection={menu_selection}
          onChange={handleChangeMenu}
          toggleExports={handleToggleExportModal}
        />
        <Container style={{ width:'100%', marginTop:'4rem'}}>
          <Dimmer active={loading}>
            <Loader content='Logging in...' />
          </Dimmer>
          <Switch>
            <Route exact path="/">
              <Corpuses/>
            </Route>
            <Route exact path="/documents">
              <Documents/>
            </Route>
            <Route exact path="/label_sets">
              <Labels/>
            </Route>
            <Route exact path="/privacy">
              <PrivacyPolicy/>
            </Route>
            <Route exact path='/terms_of_service'>
              <TermsOfService/>
            </Route>
          </Switch>
        </Container>
        <Footer/>
      </BrowserRouter>
  );
}

export default App;