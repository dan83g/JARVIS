import React, { useState, useEffect } from 'react';
import { TabView, TabPanel, TabPanelHeaderTemplateOptions } from 'primereact/tabview';
import { DataTableControl } from '../datatable/datatable'
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../index';

    
export const TabViewControl = observer(() => {
    const { tabViewStore } = useRootStore();

    const template = (options: TabPanelHeaderTemplateOptions) => {
        return (
            <a {...options.element.props} itemID={options.index} onKeyDown={(e) => tabViewStore.onTabKeyDown(options.index, e.code)} style={{height: "2.25rem"}}>
                <i {...options.leftIconElement.props}></i>
                <span className="p-tabview-title">{options.titleElement.props.children}</span>
                <i className="p-tabview-close pi pi-times" onClick={() => tabViewStore.removeTab(options.index)}></i>
            </a>            
        );
    }    

    return (
        tabViewStore.queries.length <= 0 ? null :         
        <TabView className='tabview-result' activeIndex={tabViewStore.activeIndex} onTabChange={(e) => {tabViewStore.setActiveTab(e.index); tabViewStore.setDeltaHeight();}} renderActiveOnly={false} scrollable>
            {tabViewStore.queries.map((query) => {
                return (                        
                    <TabPanel leftIcon={`pi pi-${ query.loading ? 'spin pi-spinner' : query.icon}`} header={query.title} key={query.id} closable headerTemplate={template} contentStyle={{ minHeigth: '0' }}>                            
                        {/* <DataTableControl queryId={query.id} style={{height: '100%'}}/>                             */}
                        <DataTableControl queryId={query.id}/>                            
                    </TabPanel>
                )
            })}
        </TabView>
    )
})
{/* <TabView className='tabview-result' activeIndex={tabViewStore.activeIndex} onTabChange={(e) => tabViewStore.setActiveTab(e.index)} renderActiveOnly={false} scrollable style={{height: '100%'}}> */}
{/* <TabPanel leftIcon={`pi pi-${ tab.running ? 'spin pi-spinner' : tab.icon}`} header={tab.title} key={tab.id} closable> */}