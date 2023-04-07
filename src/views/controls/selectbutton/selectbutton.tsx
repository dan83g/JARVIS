import React from 'react';
import { SelectButton, SelectButtonProps } from 'primereact/selectbutton';

interface ITemplateOption {
    id: string;
    name: string;
    value?: any;
    icon?: string | undefined;
}

interface IProps extends SelectButtonProps {
    visible?: boolean;
    idPrefix?: string;
}

export const SelectButtonControl = ({ visible = true, idPrefix, ...props }: IProps) => {

    const itemTemplate = (option: ITemplateOption) => {
        return <span className={`${option.icon ?? ""} text-sm text-center`} id={`${idPrefix}-${option.id}`}>{option.name}</span>;
    }

    return (
        visible === false ? null : <SelectButton optionLabel="name" optionValue="id" {...props} itemTemplate={itemTemplate}/>
    );
}