import React from "react";
import { 
    Icon,
    List,
    Popup,
    Statistic,
    Header
} from 'semantic-ui-react';

function ShareItem({username, email, index}) {
    return <List.Item key={index}>
      <List.Icon name='user' verticalAlign='middle' />
      <List.Content>
        <List.Header as='a'>{email}</List.Header>
      </List.Content>
    </List.Item>
}

export function SharedWithWidget ({shared_with, is_public}) {

    if (!shared_with?.length > 0 && !is_public) return <Statistic>
                                            <Statistic.Value>
                                            <Icon name='external share' />0
                                            </Statistic.Value>
                                            <Statistic.Label>Shares</Statistic.Label>
                                        </Statistic>;

    let share_elements = shared_with.map((item, index) => <ShareItem key={index} index={index} email={item.email}/>)

    if (is_public) {
        if (shared_with.length > 0) {
            return <Popup 
                        trigger={
                            <Statistic>
                                <Statistic.Value>
                                <Icon color='green' name='users' />
                                </Statistic.Value>
                                <Statistic.Label>Public</Statistic.Label>
                            </Statistic>}
                        flowing 
                        hoverable>
                            <>
                                <Header>Also Shared With:</Header>
                                <List divided relaxed>
                                    {share_elements}
                                </List>
                            </> 
                    </Popup>;
        }
        else {
            return <Statistic>
                        <Statistic.Value>
                        <Icon color='green' name='users' />
                        </Statistic.Value>
                        <Statistic.Label>Public</Statistic.Label>
                    </Statistic>;
        }
       
    }
    else
    {
        return <Popup 
                    trigger={
                        <Statistic>
                            <Statistic.Value>
                            <Icon name='external share' />{shared_with.length}
                            </Statistic.Value>
                            <Statistic.Label>Shares</Statistic.Label>
                        </Statistic>}
                    flowing 
                    hoverable>
                        {   
                            shared_with.length > 0 ? 
                            <>
                                <Header>Shared With:</Header>
                                <List divided relaxed>
                                    {share_elements}
                                </List>
                            </> :
                            <Header>No Shares</Header>
                        }   
                </Popup>;
    }
}