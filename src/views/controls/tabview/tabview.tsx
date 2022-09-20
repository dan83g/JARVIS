import React, { useEffect } from 'react';
import { TabView, TabPanel, TabPanelHeaderTemplateOptions } from 'primereact/tabview';
import { DataTableControl, IDataTablePageParams } from '../datatable/datatable';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../index';
import { ComboBoxControl,  } from '../combo/combobox';
import { AutoCompleteControl } from '../autocomplete/autocomplete';
import { IQuery, REFRESH_OPTIONS } from '../../../store/tabview';

    
export const TabViewControl = observer(() => {
    const { tabViewStore, formStore } = useRootStore();

    useEffect(() => {
        tabViewStore.setDatatableHeight();
    }, [tabViewStore, tabViewStore.QueriesCount]);    

    const headerTemplate = (options: TabPanelHeaderTemplateOptions) => {
        return (
            <a {...options.element.props} itemID={options.index} onKeyDown={(e) => tabViewStore.onTabKeyDown(options.index, e.code)}>
                <i {...options.leftIconElement.props}></i>
                <span className="p-tabview-title">{options.titleElement.props.children}</span>
                <i className="p-tabview-close pi pi-times" onClick={() => tabViewStore.removeTab(options.index)}></i>
            </a>            
        );
    }    

    const paginatorRight = (query: IQuery) => 
        // <span className="p-float-label">    
        <span>
            <label htmlFor="refreshCombo">Обновлять </label>
            <ComboBoxControl
                inputId="refreshCombo"
                options={REFRESH_OPTIONS}
                value={query.refreshInterval}
                optionLabel="label"
                filter={false}
                onChange={(e: any) => {
                    tabViewStore.refreshQuery(query.id, e.value);
                }}
            />            
        </span>

    const paginatorLeft = (query: IQuery) => <AutoCompleteControl
        value={query.value}
        suggestions={formStore.autoCompleteList}        
        onChange={(e: any) => tabViewStore.setQuerySearchValue(query.id, e.value)}
        completeMethod={(e: any) => formStore.setSearchInfo(e.query, false)}
        onSelect={(e: any) => formStore.setSearchInfo(e.value, false)}
        onKeyPress={(e: any) => {
            if (e.charCode == 13) {
                e.stopPropagation();
                tabViewStore.executeQuery(query.id, query.value, query.limit, query.offset);
            }
        }}
    />
    const onPaging = (event: IDataTablePageParams) => {
        // tabViewStore.setQueryPaging(event.query.id, event.rows, event.first);
        tabViewStore.executeQuery(event.query.id, event.query.value, event.rows, event.first);
    }

    return (
        tabViewStore.queries.length <= 0 ? null :         
        <TabView className='tabview-result' activeIndex={tabViewStore.activeIndex} onTabChange={(e) => {tabViewStore.setActiveTab(e.index); tabViewStore.setDatatableHeight();}} renderActiveOnly={false} scrollable>
            {tabViewStore.successQueries.map((query) => {
                return (                        
                    <TabPanel leftIcon={`pi pi-${ query.loading ? 'spin pi-spinner' : query.icon}`} header={query.title} key={query.id} closable headerTemplate={headerTemplate} contentStyle={{ minHeigth: '0' }}>
                        <DataTableControl 
                            query={query} 
                            datatableHeight={tabViewStore.datatableHeight} 
                            // paginator
                            paginator
                            onPaging={onPaging}
                            rows={query.limit}
                            first={query.offset}
                            paginatorRight={paginatorRight(query)}
                            paginatorLeft={paginatorLeft(query)}
                         />
                    </TabPanel>
                )
            })}
        </TabView>
    )
})