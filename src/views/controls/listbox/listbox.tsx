import React, { useState } from 'react';
import { ListBox, ListBoxProps } from 'primereact/listbox';
import { tooltipOptions } from '../tooltip/options';


export enum LogType {
    Nodata = 'nodata',
    Warning = "warning",
    Error = "error"
};

export interface LogOption {
    title: string;
    type: LogType;
    message: string;
}

export const ListBoxLog = (props: ListBoxProps) => {
    const logTemplate = (option: LogOption) => {
        let options = {
            'nodata': 'pi pi-thumbs-up green',
            'warning': 'pi pi-thumbs-down yellow',
            'error': 'pi pi-thumbs-down red'
        }
        return (
            <>
                <i className={options[option.type] ?? options['error']}> {option.title}: </i>  {option.message}
            </>
        );
    }
    
    return (
        <ListBox {...props} optionLabel="message" tooltipOptions={tooltipOptions('bottom')} listStyle={{ maxHeight: '111px', height: '111px' }} itemTemplate={logTemplate}/>
    );
}