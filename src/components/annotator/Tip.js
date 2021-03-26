// @flow
import React, { Component } from "react";
import { Card, Form, Dropdown } from 'semantic-ui-react';
import _ from 'lodash';

import "../../assets/style/Tip.css";

class Tip extends Component {
        
    constructor(props) {
        super(props);
        this.state = {
            compact: true,
            value: "",
            color: ""
        };
    }

    // for TipContainer
    componentDidUpdate(nextProps, nextState) {
        const { onUpdate } = this.props;

        if (onUpdate && this.state.compact !== nextState.compact) {
            onUpdate();
        }
    }

    handleLabelChange = (e, { name, value }) => {
        this.setState({[name]: value});
    }
    handleDropdownChange = (e, { value }) => this.setState({ value });

    handleSubmit = () => {

        const { onConfirm, label_set } = this.props;
        let choice = _.find(label_set, {id: this.state.value});

        onConfirm({
            id: choice.id,
            text: choice.label, 
            color: choice.color, 
            icon: choice.icon
        });

    }

    render() {
        const {  label_set, content, read_only } = this.props;
        
        const choices = Array.isArray(label_set) ? label_set.map((choice) => {
            return {
                key: choice.id,
                text: choice.label,
                value: choice.id,
                icon: choice.icon,
            };
        }) : [{
                key: -1,
                text: "No label set loaded...",
                value: "N/A",
                icon: "cancel"
        }];

        return (
        <div className="Tip">
            {
                !read_only ? <Card>
                    <Card.Content>
                        <Form onSubmit={this.handleSubmit} style={{ marginTop:"1em" }}>
                            <Dropdown
                                placeholder='ADD LABEL'
                                fluid
                                disabled={!Boolean(label_set)}
                                onChange={this.handleDropdownChange}
                                search
                                options={choices}
                                style={{ marginBottom:'1em' }}
                                ref={dd => (this.MyDropdown = dd)}
                                searchInput={{ autoFocus: true }}
                            />
                            <Form.Button>Add</Form.Button>
                        </Form>
                    </Card.Content>
                </Card> : <></>
            }
        </div>
        );
  }
}

export default Tip;