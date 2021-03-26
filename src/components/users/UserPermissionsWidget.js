import React from 'react';
import { connect } from 'react-redux';
import { 
    Segment,
    Dropdown,
    Table,
    Header,
    Icon,
    Popup,
    Accordion, 
    Checkbox
} from 'semantic-ui-react';
import { getUserList } from '../../api/UsersAPI';
import _ from 'lodash';
import { VerticallyCenteredDiv } from '../shared/layouts/Wrappers';
import '../../assets/style/UserPermissionsWidget.css';


function ShareRow({onPermissionsChange, onUserRemove, user_permissions, model_name}) {

    if (!user_permissions) return <></>;
    const {
        id,
        email, 
        username,
        permissions,
    } = user_permissions;

    const submitChanges = (type, add) => {
        let new_permissions = [...permissions];
        if(add) {
            new_permissions = [...new_permissions, type];
        }
        else {
            new_permissions = new_permissions.filter((perm) => perm!==type);
        }

        onPermissionsChange({
            id, 
            email,
            username,
            permissions: new_permissions
        });
    }

    let can_read = _.includes(permissions, `view_${model_name}`);
    let can_write = _.includes(permissions, `change_${model_name}`);
    let can_delete = _.includes(permissions, `delete_${model_name}`);
    let can_permission =  _.includes(permissions, `permission_${model_name}`);

    return (
        <Table.Row key={id}>
            <Table.Cell textAlign='left'>
                <Header size='medium' textAlign='center'>{email}</Header>
            </Table.Cell>
            <Table.Cell textAlign='center'>
                <Icon
                    onClick={() => submitChanges(`view_${model_name}`, !can_read)}
                    name={can_read ? 'checkmark' : 'close'}
                    positive={can_read ? 'positive' : undefined}
                    negative={can_read ? 'negative' : undefined}/>
            </Table.Cell>
            <Table.Cell textAlign='center'>
                <Icon 
                    onClick={() => submitChanges(`change_${model_name}`, !can_write)}
                    name={can_write ? 'checkmark' : 'close'}
                    positive={can_write ? 'positive' : undefined}
                    negative={can_write ? 'negative' : undefined}/>
            </Table.Cell>
            <Table.Cell textAlign='center'>
                <Icon
                    onClick={() => submitChanges(`delete_${model_name}`, !can_delete)}
                    name={can_delete ? 'checkmark' : 'close'}
                    positive={can_delete ? 'positive' : undefined}
                    negative={can_delete ? 'negative' : undefined}/>
            </Table.Cell>
            <Table.Cell textAlign='center'>
                <Icon
                    onClick={() => submitChanges(`permission_${model_name}`, !can_permission)}
                    name={can_permission ? 'checkmark' : 'close'}
                    positive={can_permission ? 'positive' : undefined}
                    negative={can_permission ? 'negative' : undefined}/>
            </Table.Cell>
            <Table.Cell textAlign='center'>
                <Icon
                    name='trash'
                    color='red'
                    onClick={() => onUserRemove(id)}
                />
            </Table.Cell>
        </Table.Row>);
}

class UserPermissionsWidget extends React.Component {

    constructor(props){
      super(props);
      this.state={
        timer: null,
        loading: false,
        search_term: "",
        last_search_term: "",
        show_selector: false,
        last_searched: Date.now(), 
        available_users:[],
      };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.model_object.is_public !== nextProps.model_object.is_public || 
            !_.isEqual(this.props.model_object.shared_with, nextProps.model_object.shared_with) || 
            !_.isEqual(this.state, nextState)) {
                return true;
            }
        return false;
    }

    toggleIsPublic = () => {
        this.props.onChangePermissions({is_public: !this.props.model_object.is_public});
    }

    toggleSelector = () => {
        this.setState({
            show_selector: !this.state.show_selector
        })
    }

    filterOutSelectedUsers = (raw_user_list, selected_user_list, filter_anonymous=true) => {
        // We don't want Django anonymous user as an option... I should probably just filter this on the server.
        if(filter_anonymous) {
            raw_user_list = raw_user_list.filter(item => item.username !== "AnonymousUser");
        }
        if (selected_user_list.length === 0) return raw_user_list;
        else {
            let difference =  _.differenceWith(raw_user_list, selected_user_list, 
                (x, y) => x.id === y.id
            );
            return difference;
        }
    }

    updateUser = (updated_permission_obj) => {
        let shared_with = [...this.props.model_object.shared_with];
        let index = _.findIndex(shared_with, {id: updated_permission_obj.id});
        shared_with.splice(index, 1, updated_permission_obj);
        this.props.onChangePermissions({shared_with});
    }

    deleteUserById = (id) => {
        
        let shared_with = [...this.props.model_object.shared_with];
        let removed_user = _.remove(shared_with, {id});

        if (removed_user && removed_user.length > 0) {
            removed_user = removed_user[0];
            console.log("Removed user: ", removed_user[0]);
            this.props.onChangePermissions({shared_with});
            this.setState({
                available_users: [...this.state.available_users, {id: removed_user.id, email: removed_user.email, username: removed_user.username}]
            }, this.props.onChangePermissions({shared_with}));
        }
        
    }

    // Add a user object to our selected user list and apply defauly permissions (read-only)
    selectUserById = (id) => {
        console.log("Select user by id", id);
        console.log("Existing available users", this.state.available_users);
        let user_to_add = _.find(this.state.available_users, {id});
        let filtered_available_users = this.filterOutSelectedUsers(this.state.available_users, [...this.props.model_object.shared_with, user_to_add]);
        console.log("Filtered users", filtered_available_users);
        if (user_to_add) {
            this.setState({
                available_users: filtered_available_users
            }, this.props.onChangePermissions({shared_with: [...this.props.model_object.shared_with, {...user_to_add, permissions: [`view_${this.props.model_name}`]}]}));
        }
    }

    setSearchTerm = (search_term) => {
        this.setState({
            search_term
        });
    }

    setLoading = (loading) => {
        this.setState({
            loading
        });
    }

    setUsers = (available_users) => {
        this.setState({
            available_users
        });
    }

    updateLastSearched = () => {
        this.setState({
            last_searched: Date.now(),
            last_search_term: this.state.search_term
        })
    }

    handleChange = (e, { value }) => {
        this.selectUserById(value);
    };

    handleSearchChange = (e, { searchQuery }) => {
        console.log("Search changed: ", searchQuery);
        this.setSearchTerm(searchQuery);
    }

    requestUserList = () => { 
        this.updateLastSearched();
        this.setLoading(true);
        getUserList(this.props.token, 1, this.state.search_term).then((response) => {
            console.log("User search response", response);
            if (response.status==200) {
                this.setUsers(this.filterOutSelectedUsers(response.data.results, this.props.model_object.shared_with)); // We don't want selected users appearing in the search results.
            }     
        });
        this.setLoading(false);
    }

    tick = () => {
        let {
            last_search_term, 
            search_term,
            last_searched,
            available_users: available_users
        } = this.state;
        let seconds = Math.floor((Date.now() - last_searched)/1000);
        
        if (seconds > 1 && search_term !== last_search_term) {
            this.requestUserList();
        }
    }

    componentDidMount() {
        this.requestUserList();
        let timer = setInterval(this.tick, 1000);
        this.setState({timer});
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    render() {

        let {
            available_users,
            show_selector
        } = this.state;

        let {
            shared_with,
            is_public
        } = this.props.model_object;

        let options = available_users.map(user => ({ 
            key: user.username, 
            text: user.email,
            value: user.id
        }));

        console.log("Selected users", shared_with);
        let rows = shared_with.map((user) => 
            <ShareRow
                key={user.id}
                user_permissions={user}
                onPermissionsChange={(updated_obj) => this.updateUser(updated_obj)}
                onUserRemove={(id) => this.deleteUserById(id)}
                model_name={this.props.model_name}
            />
        );
        console.log("Share rows", rows);

        return (
        <Segment raised style={{...this.props.style, width:'100%'}}>
            <div style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between', width:'100%', minHeight:'1.5rem'}}>
                <div>
                    <Dropdown
                        button
                        className='icon'
                        labeled
                        icon='users'
                        options={options}
                        search
                        text='Select User(s)'
                        onChange={this.handleChange}
                        onSearchChange={this.handleSearchChange}
                    />
                </div>
                { this.props.can_publish ? 
                    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div>
                            <Popup content='Everyone will have READ access to your item. You still need to select individual users to grant write access.' trigger={
                                <Checkbox
                                    toggle
                                    label='Make Public (Everyone Has View Access)'
                                    onChange={() => this.toggleIsPublic()}
                                    checked={is_public}
                                />
                            } />
                        </div>
                    </div> : <></>
                }
            </div>
            <Accordion styled style={{width:'100%'}} className={shared_with.length > 0 ? 'selected_accordion' : 'selected_accordion hidden'}>
                <Accordion.Title
                    active={show_selector}
                    index={0}
                    onClick={this.toggleSelector}
                >
                    <Icon name='dropdown' />
                    Sharing With ({shared_with.length} Selected)
                </Accordion.Title>
                <Accordion.Content active={show_selector} style={{maxHeight: '20vh', overflowY: 'scroll'}}>
                    <VerticallyCenteredDiv>
                        <Table 
                            striped
                            celled
                            size='small'
                        >
                            <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell textAlign='left'>User</Table.HeaderCell>
                                <Table.HeaderCell textAlign='center'>Read</Table.HeaderCell>
                                <Table.HeaderCell textAlign='center'>Write</Table.HeaderCell>
                                <Table.HeaderCell textAlign='center'>Delete</Table.HeaderCell>
                                <Table.HeaderCell textAlign='center'>Edit Permissions</Table.HeaderCell>
                                <Table.HeaderCell textAlign='center'>Remove User</Table.HeaderCell>
                            </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {rows && rows.length > 0 ? 
                                    rows : 
                                    <Table.Row warning colSpan='5'>
                                        <Table.Cell>
                                            <Icon name='attention' />
                                            Not Shared With Anyone
                                        </Table.Cell>
                                    </Table.Row>
                                }
                            </Table.Body>
                        </Table>
                    </VerticallyCenteredDiv>
                </Accordion.Content>   
            </Accordion> 
        </Segment>);
    }
}

function mapStateToProps(state) {
    const { 
      token 
    } = state.auth;
  
    return {
      token
    }
}
  
export default connect(mapStateToProps)(UserPermissionsWidget);