import React, { useState, useEffect, useRef, ReactPropTypes } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { CalendarInlineControl } from './controls/datepicker/inlinecalendar';
import { SelectButtonControl } from './controls/selectbutton/selectbutton';
import { ComboBoxControl } from './controls/combo/combobox';
import { ButtonControl } from './controls/button/button';

import { toast } from "react-toastify";
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../index';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ContextMenu } from 'primereact/contextmenu';


export const FormControl = observer(() => {
    // const store = useRootStore();
    // store.userStore......
    const { formStore } = useRootStore()
    const overlayPanel = useRef<OverlayPanel>(null);
    const cmTypes = useRef<ContextMenu>(null);

    useEffect(() => {
        let elInputText = document.querySelector(`.p-input-icon-right > .p-inputtext.search-input-text`) as HTMLElement;
        let elTypeBtn = document.querySelector(`.p-input-icon-right > .p-button.suffix`) as HTMLElement;
        if (elInputText)
            elInputText.style.paddingRight = `${elTypeBtn.getBoundingClientRect().width + 5}px`;
    }, [formStore.typeValue]);    

    return (
        <form className="flex justify-content-center align-items-center" onSubmit={formStore.onFormSubmit}>
            <div className="grid formgrid mt-3" style={{width: "750px"}}>
                <div className="field col-10">
                    <ContextMenu model={formStore.typesMenuOptions} ref={cmTypes}></ContextMenu>
                    <span className="p-input-icon-left p-input-icon-right" style={{width:"100%"}}>
                        <i className="pi pi-search" />
                            <InputText className='search-input-text border-radius-10' value={formStore.searchText} onChange={(e:any) => formStore.setSearchText(e.target.value)} placeholder={'Введите текст для поиска'} style={{width:"100%"}}/>
                            <Button type="button" className="btn-type suffix p-input-suffix p-button-text border-radius-10"  onClick={(e) => cmTypes?.current?.show(e)} label={formStore.typeValue}/>
                        <i/>
                    </span>
                </div>
                <div className="field col-2" style={{textAlign: "left"}}>
                    <Button icon="pi pi-search" className="p-button-rounded p-button-outlined" title='Найти'/>
                    <Button type="button" icon="pi pi-sliders-h" className="p-button-rounded p-button-outlined search-settings" onClick={() => formStore.setAdvancedVisibility(formStore.advancedVisibility ? false : true)} title='Инструменты'/>
                </div>
               
                <div className="field col-12 mb-1 p-selectbutton date-filter" style={{textAlign: "center"}}>                    
                    <SelectButtonControl
                        visible={formStore.advancedVisibility}
                        value={formStore.dateFilterValue} options={formStore.dateFilterOptions} 
                        idPrefix="date-filter"
                        onChange={(e:any) => {
                            if (e.value === "custom"){
                                overlayPanel.current?.show(e, document.getElementById('date-filter-custom') as HTMLElement);
                            }
                            formStore.setDateFilterValue(e.value);
                        }}
                    />
                    <OverlayPanel ref={overlayPanel} id="datetime-overlay-panel" showCloseIcon style={{ textAlign: "right" }}>
                        <CalendarInlineControl value={formStore.dateRange} onChange={(e: any) => formStore.setDateRange(e.value)}/>
                        <br/>
                        <ButtonControl
                            label='OK' icon="pi pi-check"
                            className="p-button-outlined mt-1"
                            style={{height: "1.75rem", width: "95px"}}
                            onClick={() => overlayPanel.current?.hide()}
                        />
                    </OverlayPanel>
                </div>
                {/* <div className="field col-12 mb-1">                    
                    <SelectButtonControl className='type-filter' visible={formStore.advancedVisibility} value={formStore.typeValue} options={formStore.typesList} onChange={(e:any) => formStore.setTypeValue(e.value)}/>
                </div> */}
                <div className="field col-8 mt-1"/>
                <div className="field col-4 mt-1">                    
                    <ButtonControl type="button" label="Очистить" icon="pi pi-times" className="p-button-text" style={{height: "1.75rem", width: "120px"}} onClick={() => formStore.onClearClick()} visible={formStore.advancedVisibility}/>
                    <ButtonControl label="Найти" icon="pi pi-search" className="p-button-outlined" style={{height: "1.75rem", width: "95px"}} visible={formStore.advancedVisibility}/>
                </div>
            </div>
            <Button type="submit" label="Поиск" tooltip='Поиск' icon="pi pi-check" style={{visibility:"hidden"}}/>
        </form>
    )
});