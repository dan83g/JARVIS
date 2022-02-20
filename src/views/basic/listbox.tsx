import React, { useState } from 'react';
import { ListBox } from 'primereact/listbox';

export const ListBoxControl = (props: any) => {
    const defaultTemplate = (option:any) => {
        return (
            <div className="country-item">
                <img alt={option.name} src="showcase/demo/images/flag_placeholder.png" onError={(e) => (e.target as any).src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} className={`flag flag-${option.code.toLowerCase()}`} />
                <div>{option.name}</div>
            </div>
        );
    }
    // itemTemplate={defaultTemplate}
    return (
        (props.visible ?? true) && <ListBox value={props.value} options={props.options} style={props.style} onChange={props.onChange} optionLabel="name" tooltip={props.tooltip} tooltipOptions={{className: 'w-4 ml-2'}}/>
    );
}