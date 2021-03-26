import React from "react";
import { 
    Statistic,
    Table,
    Icon,
    Pagination,
    Button
} from 'semantic-ui-react';

function DateTimeWidget({
    timeString, 
    dateString,
}) {

    return (
        <Statistic size='mini'>
            <Statistic.Value>{timeString}</Statistic.Value>
            <Statistic.Label>{dateString}</Statistic.Label>
        </Statistic>
    );
   
}

function ExportItemRow({
    onDelete, 
    export_item,
    key
}) {

    let requestedTime = "";
    let requestedDate = "N/A";
    if (export_item.created) {
        var dCreate = new Date(export_item.created);
        requestedTime = dCreate.toLocaleTimeString();
        requestedDate = dCreate.toLocaleDateString();
    }

    let startedTime = "";
    let startedDate = "N/A";
    if (export_item.started) {
        var dStart = new Date(export_item.started);
        startedTime = dStart.toLocaleTimeString();
        startedDate = dStart.toLocaleDateString();
    }

    let completedTime = "";
    let completedDate = "N/A";
    if (export_item.completed) {
        var dCompleted = new Date(export_item.completed);
        completedTime = dCompleted.toLocaleTimeString();
        completedDate = dCompleted.toLocaleDateString();
    }

    return (
        <Table.Row key={key}>
            <Table.Cell>
                {export_item.name}
            </Table.Cell>
            <Table.Cell>
                <DateTimeWidget timeString={requestedTime} dateString={requestedDate}/>
            </Table.Cell>
            <Table.Cell textAlign='center'>
                {
                    !export_item.started ? 
                        <Icon size='large' loading  name='cog' /> :
                        <DateTimeWidget timeString={startedTime} dateString={startedDate}/>
                }
            </Table.Cell>
            <Table.Cell textAlign='center'>
                {
                    ! export_item.completed || !export_item.started ? 
                    <Icon size='large' loading  name='cog' /> :
                    <DateTimeWidget timeString={completedTime} dateString={completedDate}/>
                }
            </Table.Cell>
            <Table.Cell textAlign='center'>
                <div>
                    <Button circular size='mini' icon="trash" color='red' onClick={() => onDelete(export_item.id)}/>
                    {
                        export_item.completed ? 
                        <Button circular size='mini' icon='download' color='blue' onClick={() => {window.location = export_item.zip;}}/> : 
                        <></>   
                    }
                </div>
            </Table.Cell>           
        </Table.Row>
    );
}

export function ExportList({
    exports,
    total_pages,
    selected_page,
    onDelete,
    onPageChange
}) {

    let export_rows = exports.map((export_item) => <ExportItemRow 
                                                        key={export_item.id} 
                                                        onDelete={onDelete} 
                                                        export_item={export_item}
                                                    />);

    return (           
        <Table celled padded style={{minHeight:'20vh'}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell textAlign='left'>Description</Table.HeaderCell>
                    <Table.HeaderCell textAlign='center'>Requested</Table.HeaderCell>
                    <Table.HeaderCell textAlign='center'>Started</Table.HeaderCell>
                    <Table.HeaderCell textAlign='center'>Completed</Table.HeaderCell>
                    <Table.HeaderCell textAlign='center'>Actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {export_rows}
            </Table.Body>
            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan='5' textAlign='center'>
                        <Pagination
                            totalPages={total_pages}
                            activePage={selected_page}
                            onPageChange={ (e, { activePage }) => onPageChange(activePage)}
                        />            
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}
