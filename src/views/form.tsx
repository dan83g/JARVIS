import React, { useState, useEffect, useRef, ReactPropTypes } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { CalendarInlineControl } from './controls/datepicker/inlinecalendar';
import { SelectButtonControl } from './controls/selectbutton/selectbutton';
import { ButtonControl } from './controls/button/button';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../index';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ContextMenu } from 'primereact/contextmenu';
import { AutoCompleteControl, AutoCompletePropsEx } from './controls/autocomplete/autocomplete';


export const FormControl = observer(() => {
    // const store = useRootStore();
    // store.userStore......
    const { formStore, tabViewStore } = useRootStore()
    const overlayPanel = useRef<OverlayPanel>(null);
    // const cmTypes = useRef<ContextMenu>(null);

    useEffect(() => {
        let elInputText = document.querySelector(`.search-input-text > .p-inputtext`) as HTMLElement;
        let elTypeBtn = document.querySelector(`.search-type-btn`) as HTMLElement;
        if (elInputText && elTypeBtn)
            elInputText.style.paddingRight = `${elTypeBtn.getBoundingClientRect().width + 5}px`;
    }, [formStore.typeValue]);    

    useEffect(() => {
        tabViewStore.setDatatableHeight();
    }, [formStore, formStore.advancedVisibility, tabViewStore]);    

    const toogleAdvancedSettings = () => {
        formStore.setAdvancedVisibility(formStore.advancedVisibility ? false : true);
    };
    return (
        <form className="flex justify-content-center align-items-center" onSubmit={formStore.onFormSubmit}>
            <div className="search-form grid formgrid mt-3">
                <div className="field col-10">
                    <AutoCompleteControl                        
                        value={formStore.searchText}
                        suggestions={formStore.autoCompleteList}
                        completeMethod={(e: any) => formStore.setSearchInfo(e.query)}
                        onSelect={(e: any) => formStore.setSearchInfo(e.value)}
                        onChange={(e: any) => formStore.setSearchText(e.value)} 
                        typeValue={formStore.typeValue}
                        typesMenuOptions={formStore.TypesMenuOptions}              
                    />
                    {/* <ContextMenu ref={cmTypes} model={formStore.typesMenuOptions}></ContextMenu> */}
                    {/* <span className="p-input-icon-left p-input-icon-right width-100">
                        <i className="search-input-icon pi pi-search" />
                            <AutoComplete  className='search-input-text width-100' placeholder={'Введите текст для поиска'}
                                value={formStore.searchText}
                                suggestions={formStore.autoCompleteList}
                                completeMethod={(e:any) => formStore.getSearchInfo(e.query)}
                                onChange={(e:any) => formStore.setSearchText(e.value)} 
                                onSelect={(e:any) => formStore.getSearchInfo(e.value)}
                            />
                            <ButtonControl visible={Boolean(formStore.typeValue)} type="button" className="search-type-btn btn-type suffix p-input-suffix p-button-text border-radius-10"  onClick={(e) => cmTypes?.current?.show(e)} label={formStore.typeValue}/>
                        <i/>
                    </span> */}
                </div>
                <div className="field col-2 text-center">
                    <Button icon="pi pi-search" className="p-button-rounded p-button-outlined" title='Найти'/>
                    <Button type="button" icon="pi pi-sliders-h" className="p-button-rounded p-button-outlined search-settings" onClick={toogleAdvancedSettings} title='Инструменты'/>
                </div>
               
                <div className="field col-12 mb-1 p-selectbutton date-filter text-left">
                    <SelectButtonControl
                        className='ml-4'                    
                        visible={formStore.advancedVisibility}
                        value={formStore.dateFilterValue} options={formStore.dateFilterOptions} 
                        idPrefix="date-filter"
                        onChange={(e:any) => {
                            if (e.value === "custom" || (formStore.dateFilterValue === "custom" && e.value === null)) {
                                let dateFilterElement = document.getElementById('date-filter-custom') as HTMLElement;
                                if (dateFilterElement) {                                
                                    overlayPanel.current?.show(e, dateFilterElement);
                                    formStore.setDateFilterValue("custom");
                                };
                            } else {
                                formStore.setDateFilterValue(e.value);
                            }
                        }}
                    />
                    <OverlayPanel ref={overlayPanel} id="datetime-overlay-panel" showCloseIcon style={{ textAlign: "right" }}>
                        <CalendarInlineControl 
                            value={formStore.dateRange} 
                            onChange={(e: any) => formStore.setDateRange(e.value)}
                        />
                        <br/>
                        <ButtonControl
                            label='OK' icon="pi pi-check"
                            className="p-button-outlined mt-1"
                            style={{height: "1.75rem", width: "95px"}}
                            onClick={() => overlayPanel.current?.hide()}
                        />
                    </OverlayPanel>
                </div>
                <div className="field col-6 mt-1"/>
                <div className="field col-4 mt-1">                    
                    <ButtonControl type="button" label="Очистить" icon="pi pi-times" className="p-button-text" style={{height: "1.75rem", width: "120px"}} onClick={() => formStore.onClearClick()} visible={formStore.advancedVisibility}/>
                    <ButtonControl label="Найти" icon="pi pi-search" className="p-button-outlined" style={{height: "1.75rem", width: "95px"}} visible={formStore.advancedVisibility} />
                </div>
            </div>
            <Button type="submit" label="Поиск" tooltip='Поиск' icon="pi pi-check" style={{display:"none"}} />
        </form>
    )
});