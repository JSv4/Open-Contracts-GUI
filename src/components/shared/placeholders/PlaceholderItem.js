import React from "react";
import { Placeholder, Card } from 'semantic-ui-react';

const PlaceholderItem = (props) => {

    const { 
        header,
        description,
    } = props;
  
  return (
    <Card key={1}>
      <Card.Content>
          <Card.Meta>{description}</Card.Meta>
          <Card.Description>
            <Placeholder>
              <Placeholder.Header image>
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder.Header>
              <Placeholder.Paragraph>
                <Placeholder.Line length='medium' />
                <Placeholder.Line length='short' />
              </Placeholder.Paragraph>
            </Placeholder>
          </Card.Description>
        </Card.Content>
    </Card>
  );
}

export default PlaceholderItem;
