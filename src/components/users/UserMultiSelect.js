import React, { useState, useEffect } from 'react';
import { 
    Segment,
    Dropdown,
    Table,
} from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { getUserList } from '../../api/UsersAPI';
import _ from 'lodash';


const default_permissions = {
    read: true, 
    write: false, 
    delete: false,
    add: false
};

export function UserMultiSelect({ 
    onChangeUsers,
    selected_user_ids
}) {

    const { token } = useSelector(state => state.auth);

    const [loading, setLoading] = useState(false);
    const [last_change, setLastChange] = useState(null);
    const [users, setUsers] = useState([]);
    const [search_term, setSearchTerm] = useState("");
    const [last_searched_term, setLastSearchedTerm] = useState("");
    
    const handleChange = (e, { value }) => {
        console.log("Dropdown change: ", value)
        onChangeUsers(value);
    };

    const handleSearchChange = (e, { searchQuery }) => {
        console.log("Search changed: ", searchQuery);
        setLastChange(Date.now());
        setSearchTerm(searchQuery);
    }

    async function requestUserList() { 
        let request = await getUserList(token, 1, search_term);
        return request        
    }
    
    useEffect(() => {
        let interval = null;
        interval = setInterval(() => {
            let seconds = Math.floor((Date.now() - last_change)/1000);
            console.log("Seconds", seconds)
            console.log("last_search_term", last_searched_term);
            console.log("current search term", search_term);
            if (seconds > 1 && last_searched_term!==search_term) {
                setLoading(true);
                setLastSearchedTerm(search_term);
                setLastChange(Date.now());
                requestUserList().then((response) => {
                    console.log("User search response", response);
                    if (response.status==200) {
                        setUsers(response.data.results);
                    }
                });
                setLoading(false);
            }
        }, 1000);
    }, [last_change, last_searched_term, search_term, setLastChange, setLastSearchedTerm, setLoading, requestUserList]);
    
    // Refresh page when we load the component...
    useEffect(() => {
        if (token) {
            requestUserList();
        }
    }, []);

    const options = users.map(user => ({ 
        key: user.username, 
        text: user.email,
        value: user.id
    }));

    return (
        <Segment raised>   
            <Dropdown
                button
                className='icon'
                floating
                labeled
                icon='users'
                options={options}
                search
                text='Select User(s)'
                onChange={handleChange}
                onSearchChange={handleSearchChange}
            />
             {/* <Dropdown
                fluid
                selection
                multiple={true}
                search={search_term}
                options={options}
                value={selected_user_ids}
                placeholder='Add Users'
                onChange={handleChange}
                onSearchChange={handleSearchChange}
                disabled={loading}
                loading={loading}
            /> */}
             <Table celled padded>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell singleLine>User</Table.HeaderCell>
                    <Table.HeaderCell>Read</Table.HeaderCell>
                    <Table.HeaderCell>Write</Table.HeaderCell>
                    <Table.HeaderCell>Delete</Table.HeaderCell>
                    <Table.HeaderCell>Remove User</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            A
                        </Table.Cell>
                        <Table.Cell singleLine>
                            B
                        </Table.Cell>
                        <Table.Cell>
                            C
                        </Table.Cell>
                        <Table.Cell textAlign='right'>
                            D
                        </Table.Cell>
                        <Table.Cell>
                            E
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </Segment>
    );
}
