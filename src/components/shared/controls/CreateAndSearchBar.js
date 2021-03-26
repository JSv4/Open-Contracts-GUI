import React, { useState } from 'react';
import { 
    Segment,
    Button,
    Form,
    Dropdown
} from 'semantic-ui-react';


export const CreateAndSearchBar = (props) => {

    const { actions, onSubmit, placeholder, value } = props;
    const [local_search_term, setLocalSearchTerm] = useState(value ? value : "");

    let buttongroup = <></>;
    let buttons = []

    buttons = actions?.map(action_json => <Dropdown.Item
                                            icon={action_json.icon}
                                            text={action_json.title}
                                            onClick={action_json.action_function}
                                            key={action_json.title}
                                            color={action_json.color}/>);

    buttongroup =  buttons?.length > 0 ? (
        <Button.Group color='teal' floated='right' style={{marginRight:'10px'}} disabled={buttons?.length > 0 ? 'disabled' : undefined}>
            <Button>Actions</Button>
            <Dropdown
                className='button icon'
                floating
                trigger={<></>}
            >
                <Dropdown.Menu>
                    {buttons}
                </Dropdown.Menu>
            </Dropdown>
        </Button.Group>
    ) : <></>;

    return (<Segment raised style={{width:'100%', marginTop: '1rem',  marginLeft: '1rem',  marginRight: '1rem'}}>
        <div style={{
            height: '100%',
            display:'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        }}>
            <div style={{width:'25vw'}}>
                <Form onSubmit={() => onSubmit(local_search_term)}>
                    <Form.Input
                        icon='search'
                        placeholder={placeholder}
                        onChange={(data)=> setLocalSearchTerm(data.target.value)}
                        value={local_search_term}
                    />
                </Form>
            </div>
            <div>
                {buttongroup}
            </div>
        </div>
    </Segment>);
}
