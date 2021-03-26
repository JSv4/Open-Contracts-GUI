import React from "react";
import { Image, Popup } from 'semantic-ui-react';

export const UsState = (props) => {

    const { 
        state_abbreviation,
        avatar,
        circular,
        size,
        style,
        content, 
        header,
        floated
    } = props;

    return (
        <Popup
            content={content ? content : ""}
            key={state_abbreviation}
            header={header ? header : ""}
            trigger={<Image
                style={style ? style : {}} 
                src={`./states/${state_abbreviation}.png`}
                avatar={Boolean(avatar)}
                size={size ? size : 'mini'}
                floated={floated ? floated : ""}
            />}
            circular={Boolean(circular)}
        />
        
    );
}