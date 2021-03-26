import React from "react";
import CompanyItem from './CompanyItem';
import PlaceholderItem from '../shared/placeholders/PlaceholderItem';

import { Card, Segment } from 'semantic-ui-react';

const CompanyCards = (props) => {

    const { 
        items 
    } = props;

    let cards = <PlaceholderItem description="No Matching Companies..."/>;

    if (items && items.length > 0) {
        cards = items.map(item => {

            let info = item.companyinfo_set[0];
    
            return <CompanyItem
                key={item.cik}
                state_location={info.state_location}
                state_incorporation={info.state_incorporation}
                name={info.name}
                sic={info.sic}
                cik={item.cik} 
            />;
        });
    } 
  
    return (
        <Segment style={{width: '100%', padding:'1rem', margin:'1rem', minHeight:'40vh'}}>
            <Card.Group itemsPerRow={4} style={{width:'100%', padding:'1rem'}}>
                {cards}
            </Card.Group>   
        </Segment>
       
    );
}

export default CompanyCards;
