

import React from "react";
import { Segment } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';

const ColorPickerSegment = (props) => {

    const { 
        color,
        setColor,
        width
    } = props;
   
    return (
        <Segment style={{width: width ? width : '20vw'}}>
            <SliderPicker
                color={ color }
                onChangeComplete={ setColor }
            />
        </Segment>
      );    
}

export default ColorPickerSegment;
