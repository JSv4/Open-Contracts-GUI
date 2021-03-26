import React from "react";
import { 
    Icon,
    Popup,
    Statistic,
    Header
} from 'semantic-ui-react';


export function LabelSetStatistic ({label_set}) {

    if (label_set) {
        return <Popup 
                    trigger={
                        <Statistic>
                            <Statistic.Value>
                                <Icon color='green' name='checkmark' /> YES
                            </Statistic.Value>
                            <Statistic.Label>Label Set</Statistic.Label>
                        </Statistic>}
                    flowing 
                    hoverable
                >
                    <Header as='h3' image={label_set?.icon} content={label_set?.title} subheader={label_set?.description}/>
                </Popup>;
    }
    else
    {
        return  <Statistic>
                    <Statistic.Value>
                    <Icon name='cancel' color='red'/> NO
                    </Statistic.Value>
                    <Statistic.Label>Label Set</Statistic.Label>
                </Statistic>;
    }
}