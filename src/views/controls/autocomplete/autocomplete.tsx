import React, { useRef } from 'react';
import { AutoComplete, AutoCompleteProps } from 'primereact/autocomplete';
import { ButtonControl } from '../button/button';
import { ContextMenu } from 'primereact/contextmenu';


export interface AutoCompletePropsEx extends AutoCompleteProps {
    typeValue?: string;
    typesMenuOptions?: any[];
}


export const AutoCompleteControl = ({ typeValue, typesMenuOptions, ...props }: AutoCompletePropsEx) => {
    const cmTypes = useRef<ContextMenu>(null);

    return (        
        <span className="p-input-icon-left p-input-icon-right width-100">
            <i className="search-input-icon pi pi-search" />
                <ContextMenu ref={cmTypes} model={typesMenuOptions}></ContextMenu>
                <AutoComplete  {...props} className='search-input-text width-100' placeholder={'Введите текст для поиска'}/>
                <ButtonControl text visible={Boolean(typeValue)} type="button" className="search-type-btn btn-type suffix p-input-suffix p-button-text border-radius-10"  onClick={(e) => cmTypes?.current?.show(e)} label={typeValue}/>
            <i/>
        </span>
    )
}    