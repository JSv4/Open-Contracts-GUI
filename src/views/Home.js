import React from 'react'
import {
  Button,
  Container,
  Header,
  Icon,
  Popup
} from 'semantic-ui-react'

import { HorizontallyCenteredDiv, VerticallyCenteredDiv } from '../components/shared/layouts/Wrappers';

const Home = () => {

  return (
    <Container fluid>
      <VerticallyCenteredDiv style={{
        backgroundImage: 'url(/images/background/home_background.jpg)', 
        backgroundSize: '100%',
        minHeight:'95vh',
        marginTop:'4rem'
      }}>
        <div style={{
          position: 'absolute',
          left:'3vw',
          top:'12vh',
          height:'20vh', 
          width: '30vw'
        }}>
          <VerticallyCenteredDiv>
            <HorizontallyCenteredDiv style={{margin:'1rem'}}>
              <div>
                <Header
                  as='h1'
                  content='Open Contracts'
                  inverted
                />
              </div>
            </HorizontallyCenteredDiv>
            <HorizontallyCenteredDiv style={{margin:'1rem', textAlign: 'center'}}>
              <div>
                <Header
                  as='h2'
                  content='Open Source Contracts and AI Contract Labelling'
                  inverted
                />
              </div>
            </HorizontallyCenteredDiv>
            <HorizontallyCenteredDiv style={{margin:'1rem'}}>
              <div>
                <Popup 
                  content='Browse public contracts or labelled document sets above. Click login to upload and/or annotate your own documents.' 
                  trigger={
                  <Button primary size='huge'>
                    Get Started
                    <Icon name='right arrow' />
                  </Button>}
                  position='bottom left'
                /> 
              </div>
            </HorizontallyCenteredDiv>  
          </VerticallyCenteredDiv>
        </div>
      </VerticallyCenteredDiv>       
    </Container>);

}

export default Home;
