import React from 'react';
import { 
    Header,
    Dropdown,
    Segment
} from 'semantic-ui-react';
import { getLabelsetSearchList } from '../../../api/LabelsetAPI';
import _ from 'lodash';
import { connect } from 'react-redux';

class LabelSetSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timer: null,
            loading: false,
            search_term: "",
            last_search_term: "",
            show_selector: false,
            last_searched: Date.now(), 
            available_labelsets:[],
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.label_set !== nextProps.label_set || !_.isEqual(this.state, nextState)) {
            return true;
        }
        return false;
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

    setAvailableLabels = (available_labelsets) => {
        this.setState({
            available_labelsets
        });
    }

    updateLastSearched = () => {
        this.setState({
            last_searched: Date.now(),
            last_search_term: this.state.search_term
        })
    }

    handleChange = (e, { value }) => {
        console.log("Label changed", value);
        this.props.onChange({label_set: value});
    };

    handleSearchChange = (e, { searchQuery }) => {
        console.log("Search changed: ", searchQuery);
        this.setSearchTerm(searchQuery);
    }

    requestLabelsetList = () => { 
        this.updateLastSearched();
        this.setLoading(true);
        getLabelsetSearchList(this.props.token, 1, this.state.search_term).then((response) => {
            console.log("Labelset search response", response);
            if (response.status===200) {
                this.setAvailableLabels(response.data.results);
            }     
        });
        this.setLoading(false);
    }

    tick = () => {
        let {
            last_search_term, 
            search_term,
            last_searched,
        } = this.state;
        let seconds = Math.floor((Date.now() - last_searched)/1000);
        
        if (seconds > 1 && search_term !== last_search_term) {
            this.requestLabelsetList();
        }
    }

    componentDidMount() {
        this.requestLabelsetList();
        let timer = setInterval(this.tick, 1000);
        this.setState({timer});
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    render() {

        let options = this.state.available_labelsets.map((labelset) => 
            ({
                key: labelset.id,
                text: labelset.title,
                value: labelset.id,
                content: (
                    <Header image={labelset.icon} content={labelset.title} subheader={labelset.description} />
                ),
            })
        );

        return <div style={{width:'100%'}}>
                    <Header as='h5' attached='top'>
                        Label Set:
                    </Header>
                    <Segment attached>
                        <Dropdown
                            disabled={this.props.read_only ? 'disabled' : undefined}
                            selection
                            clearable
                            fluid
                            options={options}
                            style={{...this.props.style}}
                            onChange={this.handleChange}
                            placeholder='Choose a label set'
                            value={this.props?.label_set?.id}
                        />
                    </Segment>
                </div>;
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
  
export default connect(mapStateToProps)(LabelSetSelector);
