import React, { useState, useEffect } from 'react';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../index';


interface Props extends DataTableProps {
    queryId: string;
}

export const DataTableControl = observer(({ queryId, ...props }: Props) => {
    const { tabViewStore } = useRootStore();
    const query = tabViewStore.getQuery(queryId)


    // useEffect(() => {
    //     loadLazyData();
    // },[lazyParams]) // eslint-disable-line react-hooks/exhaustive-deps
    // console.warn(query?.columns)

    return (
        !query?.data ? null :
        <DataTable 
            value={query?.data}
            filterDisplay="row"
            scrollable
            // scrollHeight={'flex'}
            scrollHeight={`calc(100vh - ${tabViewStore.deltaHeight}px)`}
            
            // onSort={onSort} sortField={lazyParams.sortField} sortOrder={lazyParams.sortOrder}
            // filterMatchMode={}
            // onFilter={onFilter}                 
            loading={query?.loading}
            showGridlines>
                {query?.columns?.map((col, i) => {
                    return <Column key={i} field={col} header={col} className='no-filter-icon' sortable filter filterPlaceholder="" showFilterMatchModes={false} filterMatchMode={'contains'}/>
                })}
        </DataTable>
    );
})

                // <Column field="name" header="Name" sortable filter filterPlaceholder="Введите фильтр" />
                // <Column field="country.name" header="Country" sortable filter filterPlaceholder="Введите фильтр" />
                // <Column field="company"header="Company"  sortable filter filterPlaceholder="Введите фильтр" />
                // <Column field="representative.name" header="Representative" sortable filter filterPlaceholder="Введите фильтр" />

                // {Object.keys(customers).map((col: any, i) => {
                //     return (
                //         <Column key={i} field={col} header={col} sortable filter filterPlaceholder="Введите фильтр"/>
                //     )
                // })}                