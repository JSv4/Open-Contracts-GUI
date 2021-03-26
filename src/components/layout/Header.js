
import {Menu, Dropdown, Image, Icon} from 'semantic-ui-react';
import {header_menu_items} from '../../configurations/menus';
import { useLocation } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import gordium_logo from '../../assets/images/gordium/gordium_128.png'

export default function AppHeader(props) {

    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
    const { pathname } = useLocation();

    let public_header_items = header_menu_items.filter(item => !item.protected)
    let private_header_items = header_menu_items.filter(item => item.protected)

    const items = public_header_items.map((item) => 
        <Menu.Item
            name={item.title}
            active={pathname===item.route}
            key={`${item.title}`}
        >
            <Link to={item.route}>{item.title}</Link>
        </Menu.Item>);
    
    const private_items = private_header_items.map((item) => 
        <Menu.Item
            name={item.title}
            active={pathname===item.route}
            key={`${item.title}`}
        >
            <Link to={item.route}>{item.title}</Link>
        </Menu.Item>
    );

    return (
        <Menu fluid fixed='top' inverted>
            <Menu.Item header>
                <Image size='mini' src={gordium_logo} style={{ marginRight: '1.5em' }} />
                Open Contracts
            </Menu.Item>
            {!isLoading && user ? [...items, ...private_items] : items}
            <Menu.Menu position='right'>
                {!isLoading && user ? 
                    <>
                        <Menu.Item>
                            <Image src={user.picture} avatar/>
                            <Dropdown
                                item
                                simple
                                icon={ <Icon style={{marginLeft:'5px'}} name='dropdown'/>}
                                text={` ${user.name}`}
                                style={{margin:'0px', padding:'0px'}} 
                                header='Logout'>
                                <Dropdown.Menu>
                                    <Dropdown.Item 
                                        text='Logout'
                                        onClick={() => logout({ returnTo: window.location.origin })}
                                        icon={<Icon name='log out'/>}
                                    />
                                    {/* <Dropdown.Item 
                                        text='Settings'
                                        onClick={() => console.log("Do nothing yet...")}
                                        icon={<Icon name='settings'/>}
                                    /> */}
                                    <Dropdown.Item
                                        text="Exports"
                                        onClick={() => props.toggleExports()}
                                        icon={<Icon name='download'/>}
                                    />
                                </Dropdown.Menu>
                            </Dropdown>
                        </Menu.Item>   
                    </>
                :
                    <Menu.Item onClick={() => loginWithRedirect()}>
                        Login
                    </Menu.Item>
                }
               
            </Menu.Menu>
        </Menu>
    );
}
