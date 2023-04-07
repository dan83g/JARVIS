import React, { useEffect } from 'react';
import { TabView, TabPanel, TabPanelHeaderTemplateOptions } from 'primereact/tabview';
import { DataTableControl, IDataTablePageEvent } from '../datatable/datatable';
import { Paginator } from 'primereact/paginator';
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

    const paginatorLeft = (query: IQuery) => 
        <AutoCompleteControl
            value={query.value}
            suggestions={formStore.autoCompleteList}        
            onChange={(e: any) => tabViewStore.setQuerySearchValue(query.id, e.value)}
            completeMethod={(e: any) => formStore.setSearchInfo(e.query, false)}
            onSelect={(e: any) => formStore.setSearchInfo(e.value, false)}
            onKeyPress={(e: any) => {
                if (e.charCode === 13) {
                    e.stopPropagation();
                    tabViewStore.executeQuery(query.id, query.value, query.limit, query.offset);
                }
            }}
        />

    const onPaging = (event: IDataTablePageEvent) => {
        // if paging params not equal with existing params
        if (event.query.offset !== event.first || event.query.limit !== event.rows)
            tabViewStore.executeQuery(event.query.id, event.query.value, event.rows, event.first);
    }

    return (
        tabViewStore.queries.length <= 0 ? null :         
        <TabView className='tabview-result' activeIndex={tabViewStore.activeIndex} onTabChange={(e) => {tabViewStore.setActiveTab(e.index); tabViewStore.setDatatableHeight();}} renderActiveOnly={false} scrollable>
            {tabViewStore.successQueries.map((query) => {               
                return (
                    query.iframe === true ?
                    <TabPanel leftIcon={`pi pi-${query.loading ? 'spin pi-spinner text-green-500' : query.icon}`} header={query.title} key={query.id} closable headerTemplate={headerTemplate}>
                        <div className='iframe-parent-div' style={{height: `calc(100vh - ${tabViewStore.datatableHeight}px - 46px)`}}>
                            <iframe className='w-full h-full noborder' title={query.title} src={query.url} />
                            <Paginator leftContent={paginatorLeft(query)} rightContent={paginatorRight(query)} template={{}}/>
                        </div>
                    </TabPanel> :
                    <TabPanel leftIcon={`pi pi-${query.loading ? 'spin pi-spinner text-green-500' : query.icon}`} header={query.title} key={query.id} closable headerTemplate={headerTemplate}>
                        <DataTableControl 
                            query={query} 
                            datatableHeight={tabViewStore.datatableHeight}
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