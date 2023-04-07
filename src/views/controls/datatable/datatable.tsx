import React, { useState, useRef } from 'react';
import { DataTable, DataTableProps, DataTablePageEvent, DataTableSelectionChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { observer } from 'mobx-react-lite';
import { BookType } from  'xlsx';
import { ContextMenu } from 'primereact/contextmenu';
import { BestPaginatorTemplate } from '../paginator/template';
import { PaginatorTemplate } from 'primereact/paginator';
import copy from 'copy-to-clipboard';
import { IQuery } from '../../../store/tabview';


const getFilename = (queryName: string, ext: string): string => {
    let date = new Date();
    return `${queryName}-${date.toISOString().slice(0, 10)}-${date.getTime()}.${ext}`;
}

// export interface IDataTablePageParams extends DataTablePageEvent {
//     queryId: string;
// }

// export interface IPartialQuery {
//     id: string;
//     title: string;
//     loading: boolean;
//     data: Object[];
//     columns: string[];
//     value: string;
//     limit: number;
//     offset: number;
// }

export interface IDataTablePageEvent extends DataTablePageEvent {
    query: IQuery;
}

export interface IProps extends DataTableProps<any> {
    query: IQuery;
    datatableHeight: number;
    onPaging(e: IDataTablePageEvent): void;
}

export const DataTableControl = observer(({ query, datatableHeight, onPaging, ...props }: IProps) => {
    const [selected, setSelected] = useState<any>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(50);

    // context menu
    const contextMenu = useRef<ContextMenu>(null);
    const contextMenuOptions = [
        {label: 'Копировать', icon: 'pi pi-fw pi-copy', command: () => copyToClipboard()},
        {separator: true},
        {
            label: 'Сохранить как...',
            icon: 'pi pi-fw pi-save',
            items: [
                {
                    label: 'excel',
                    icon: 'pi pi-fw pi-file-excel',
                    command: () => exportFile(`${query?.title}`, 'xlsx')
                },
                {
                    label: 'csv',
                    icon: 'pi pi-fw pi-file',
                    command: () => exportFile(`${query?.title}`, 'csv')
                },
                {
                    label: 'rtf',
                    icon: 'pi pi-fw pi-book',
                    command: () => exportFile(`${query?.title}`, 'rtf')
                },
            ]
        },
        
    ];             
    const copyToClipboard = () => {
        console.log(selected);
        let data = selected?.map((x: any) => x['value']).join('\r\n');
        console.log(data);
        copy(`${data}`)
    }

    // export
    const exportFile = (queryName: string, exportType: BookType) => {
        import('xlsx').then(xlsx => {
            let data: any[] = query && query.data ? query.data : []
            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, { bookType: exportType, type: 'array' });
            import('file-saver').then(FileSaver => {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                const data = new Blob([excelBuffer], {type: EXCEL_TYPE});
                FileSaver.saveAs(data, getFilename(queryName, exportType));
            });
        });
    }

    const onPage = (event: DataTablePageEvent): void => {
        let evt = event as IDataTablePageEvent;
        evt.query = query;
        onPaging(evt);
        // setFirst(event.first);
        // setRows(event.rows);
        // setCurrentPage(event.page + 1);
    }    

    return (
        !query?.data ? null :
        <div style={{height: `calc(100vh - ${datatableHeight}px)`}}>
            <ContextMenu model={contextMenuOptions} ref={contextMenu}/>
            <DataTable
                { ...props }

                value={query?.data}
                loading={query?.loading}
                filterDisplay="row"

                // contextMenu
                onContextMenu={e => {contextMenu.current?.show(e.originalEvent)}}
    
                // paginator
                onPage={onPage}
                paginatorTemplate={BestPaginatorTemplate as PaginatorTemplate}
                // paginatorLeft={paginatorLeft}
                // paginatorRight={paginatorRight}
                // onPage={onPage}

                // selection
                selection={selected}
                selectionMode="multiple" cellSelection
                onSelectionChange={(e: DataTableSelectionChangeEvent<any>) => {setSelected(e.value); contextMenu.current?.hide(e.originalEvent);}}

                // scroll
                scrollable
                scrollHeight='flex'                

                showGridlines
                stripedRows                
                resizableColumns 
                columnResizeMode="fit" 
                emptyMessage="Нет данных"         
                
                // onSort={onSort} sortField={lazyParams.sortField} sortOrder={lazyParams.sortOrder}
                // filterMatchMode={}
                // onFilter={onFilter}      
                >
                    {query?.columns?.map((col, i) => {
                        return <Column 
                            key={i}
                            field={col}
                            header={col}
                            className='no-filter-icon'
                            body={data => {return <div dangerouslySetInnerHTML={{ __html: data[col] }}></div>}}
                            sortable
                            filter filterPlaceholder="" showFilterMatchModes={false} filterMatchMode={'contains'}
                        />
                    })}
            </DataTable>
        </div>
    );
})
