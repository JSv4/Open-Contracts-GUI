import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button } from 'semantic-ui-react';
import { UsState } from '../shared/stats/UsState';

const CompanyItem = (props) => {

    const { 
      state_location,
      state_incorporation,
      name,
      sic,
      cik 
    } = props;
  
  return (
    <Card>
      <Card.Content>
          <UsState 
            size='mini'
            floated='right'
            state_abbreviation={state_location}
            header={`HQ Location: ${state_location}`}
            content="More info to come..."
          />
          <UsState 
            size='mini'
            floated='right'
            state_abbreviation={state_incorporation}
            header={`Incorporation Location: ${state_incorporation}`}
            content="More info to come..."
          />
          <Card.Header>{name}</Card.Header>
          <Card.Meta>{`Company CIK: ${cik}`}</Card.Meta>
          <Card.Description>
            {sic}
          </Card.Description>
        </Card.Content>
    <Card.Content extra>
      <div>
        <Button content='See Contracts' primary />
        <Button content='See Corpuses' secondary />
      </div>
    </Card.Content>
    </Card>
  );
}

export default CompanyItem;
