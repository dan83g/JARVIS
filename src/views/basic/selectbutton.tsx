import React, { useState } from 'react';
import { SelectButton, SelectButtonProps, SelectButtonChangeTargetOptions } from 'primereact/selectbutton';


interface SelectButtonOption extends Omit<SelectButtonChangeTargetOptions, 'value'>{
    icon?: string | undefined;
    value?: any;
}

interface Props extends SelectButtonProps {
    visible?: boolean;
    idPrefix?: string;
}

export const SelectButtonControl = ({ visible = true, ...props }: Props) => {

    const itemTemplate = (option: SelectButtonOption) => {
        return <span className={`${option.icon ?? ""} text-sm text-center`} id={`${props.idPrefix}-${option.id}`}>{option.name}</span>;
    }

    return (
        visible == false ? null : <SelectButton optionLabel="name" optionValue="id" {...props} itemTemplate={itemTemplate}/>
    );
}