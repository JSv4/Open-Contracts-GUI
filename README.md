# Welcome to Open Contracts (GUI)

This is the GUI for the Open Contracts project open source contract labeling platform. 

**Check out the sandbox demo at [opencontracts.opensource.legal](opencontracts.opensource.legal).**

# Installation

Clone the repository to a local directory using

    git clone https://github.com/JSv4/Open-Contracts-GUI

You'll want to create a .env file with configuration values (or, if you're deploying to Heroku, you'll need to enter these config variables into the Heroku control panel for the target app):

    cd open-contracts-gui
    nano .env 

## You will want to define the following env variables:

### Auth0 Configuration Variables 
You can use alternative authentication, but this is what we're using for now and all we've built out. You'll need the following config vars:

 1. ACT_APP_AUTH0_CLIENTID=(Your Public Client ID)
 2. REACT_APP_AUTH0_AUDIENCE=(Your App Audience)
 3. REACT_APP_AUTH0_API_AUDIENCE=(Your API Audience)
 4. REACT_APP_AUTH0_DOMAIN= (Your Auth0 Domain)
 5. REACT_APP_AUTH0_SCOPE="read:current_user update:current_user_metadata"

### Backend URLs
REACT_APP_PRODUCTION_API_URL=(URL for production backend)
REACT_APP_DEVELOPMENT_API_URL=(URL for local backend, such as "http://localhost:8000")

### Application Settings (to switch on and off certain experimental or in-development features)
REACT_APP_ALLOW_RELATIONS = false *(There is incomplete, experimental support for feature relationships, disabled by default and in our sandbox)*
REACT_APP_ALLOW_DOC_TYPE_TAGGING = false *(The backend supports document type tags, but the GUI doesn't support this yet).* 

### REACT SETTINGS
CHOKIDAR_USEPOLLING = true
FAST_REFRESH = false

# To run a local development server:

    cd opencontracts_gui
    yarn install
    yarn start

# Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

