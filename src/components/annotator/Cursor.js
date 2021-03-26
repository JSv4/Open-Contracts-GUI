import React, {useState, useEffect} from "react";
import {Image} from 'semantic-ui-react';

import target_icon from '../../assets/images/relations/target.png';
import source_icon from '../../assets/images/relations/source.png';

const Cursor = ({source, target}) => {
    const [position, setPosition] = useState({x: 0, y: 0});
    useEffect(() => {
        addEventListeners();
        return () => removeEventListeners();
    }, []);

    const addEventListeners = () => {
        document.addEventListener("mousemove", onMouseMove);
    };
    
    const removeEventListeners = () => {
        document.removeEventListener("mousemove", onMouseMove);
    };

    const onMouseMove = (e) => {
        setPosition({x: e.clientX, y: e.clientY});
    };                                                               
    
    return <div className="cursor"
        style={{
            left: `${position.x-10}px`,
            top: `${position.y-50}px`,
        }}>
            { target? <div><b>TARGET</b><Image inline src={target_icon} style={{width:'50x', height: '50px'}}/></div> : <></> }
            { source ? <div><b>SOURCE</b><Image inline src={source_icon} style={{width:'50x', height: '50px'}}/></div> : <></> }
        </div>;
}

export default Cursor;