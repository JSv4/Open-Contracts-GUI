// @flow

import React from "react";
import {Icon, Popup, Button, Label} from 'semantic-ui-react';

import "../../assets/style/Highlight.css";

class Highlight extends React.PureComponent {
  
    render() {

        const {
            position,
            onClick,
            onMouseOver,
            onMouseOut,
            comment,
            selected,
            origin, 
            target,
            onLink
        } = this.props;

        const { rects, boundingRect } = position;

        return (
            <div className={`Highlight ${selected ? "Highlight--scrolledTo" : ""}`}>
                {origin ? <div
                    style={{
                        position: 'absolute',
                        zIndex: 100,
                        left: boundingRect.left - 40,
                        top: boundingRect.top - 25
                    }}
                >  
                    <Popup trigger={<Icon size='huge' name='location arrow' color='green'/>} flowing hoverable>
                        <Button onClick={() => onLink()} positive>Create Relationship</Button>
                    </Popup>
                    
                </div> : <></>}
                {target ? <div
                    style={{
                        position: 'absolute',
                        zIndex: 100,
                        left: boundingRect.left - 40,
                        top: boundingRect.top - 25
                    }}
                >  
                    <Popup trigger={<Icon size='huge' name='target' color='red'/>} flowing hoverable>
                        <Button onClick={() => onLink()} positive>Create Relationship</Button>
                    </Popup>
                </div> : <></>}
                <div className="Highlight__parts">
                    <div className={`${comment?.id ? comment.id : 1}`}>
                        {rects.map((rect, index) => {
                            
                            let style = {...rect, borderRadius: '.25rem'};
                            if (comment?.color) {
                                style['backgroundColor'] = comment.color;
                            } 

                            return  <div
                                        onMouseOver={onMouseOver}
                                        onMouseOut={onMouseOut}
                                        onClick={onClick}
                                        key={index}
                                        style={style}
                                        className={`Highlight__part`}
                                        />;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default Highlight;