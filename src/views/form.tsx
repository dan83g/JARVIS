import React, { useState, useEffect, useRef, ReactPropTypes } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { CalendarInlineControl } from './basic/datepicker';
import { SelectButtonControl } from './basic/selectbutton';
import { ComboBoxControl } from './basic/combo';
import { ButtonControl } from './buttons';

import { toast } from "react-toastify";
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../index';
import { OverlayPanel } from 'primereact/overlaypanel';


export const FormControl = observer(() => {
    // const store = useRootStore();
    // store.userStore......
    const { formStore } = useRootStore()
    const overlayPanel = useRef<OverlayPanel>(null);

    return (        
        <form className="flex justify-content-center align-items-center" onSubmit={formStore.onFormSubmit}>
            <div className="grid formgrid mt-3" style={{width: "700px"}}>
                <div className="field col-11">
                    <span className="p-input-icon-left p-input-icon-right" style={{width:"100%"}}>
                        <i className="pi pi-search" />
                        <InputText className='border-radius-10' value={formStore.searchText} onChange={(e:any) => formStore.onChangeSearchText(e.target.value)} placeholder={'Введите текст для поиска'} style={{width:"100%"}}/>
                        <Button type="button" icon="pi pi-times" tabIndex={-1} className="suffix p-input-suffix p-button-text"  onClick={() => formStore.onChangeSearchText("")} title="Очистить" style={formStore.searchTextButtonVisibility ? {} : { display: 'none' }}/>
                        <i/>
                    </span>
                </div>
                <div className="field col-1">
                    <Button type="button" icon="pi pi-sliders-h" className="p-button-rounded p-button-outlined" onClick={() => formStore.setAdvancedVisibility(formStore.advancedVisibility ? false : true)} title='Инструменты'/>
                </div>


                {/* <div className="field col-9 mb-1 p-selectbutton date-filter" style={{textAlign: "left"}}>   */}
                <div className="field col-3 mb-1" style={{textAlign: "left"}}>                    
                    <ComboBoxControl
                        className='type-filter text-sm'
                        visible={formStore.advancedVisibility} value={formStore.typeValue} options={formStore.typesData}
                        onChange={(e:any) => formStore.setTypeValue(e.value)}
                        placeholder="Введите тип"
                    />
                </div>                
                <div className="field col-9 mb-1 p-selectbutton date-filter" style={{textAlign: "right"}}>                    
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
                    <SelectButtonControl className='type-filter' visible={formStore.advancedVisibility} value={formStore.typeValue} options={formStore.typesData} onChange={(e:any) => formStore.setTypeValue(e.value)}/>
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