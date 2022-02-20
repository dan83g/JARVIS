import React from 'react';
import { Dropdown, DropdownProps } from 'primereact/dropdown';


interface Props extends DropdownProps {
    visible?: boolean;
}

export const ComboBoxControl = ({ visible = true, ...props }: Props) => {
    return (
        visible == false ? null : <Dropdown value={props.value} options={props.options} onChange={props.onChange} optionLabel="name" filter filterBy="name" placeholder={props.placeholder} className={props.className}/>
    );
}