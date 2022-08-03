import React, { useState, useRef } from 'react';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../index';
import { BookType } from  'xlsx';
import { ContextMenu } from 'primereact/contextmenu';
import copy from 'copy-to-clipboard';


const getFilename = (queryName: string, ext: string): string => {
    let date = new Date();
    return `${queryName}-${date.toISOString().slice(0, 10)}-${date.getTime()}.${ext}`;
}

interface Props extends DataTableProps {
    queryId: string;
}

export const DataTableControl = observer(({ queryId, ...props }: Props) => {
    const { tabViewStore } = useRootStore();
    const query = tabViewStore.getQuery(queryId);
    const [selected, setSelected] = useState([]);    

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
        let data = selected?.map((x) => x['value']).join('\r\n');
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

    const bodyTemplate = (data:any) => {
        return data;
    }    

    return (
        !query?.data ? null :
        <div>
            <ContextMenu model={contextMenuOptions} ref={contextMenu}/>
            <DataTable
                value={query?.data}

                filterDisplay="row"

                // header={renderHeader}
                // contextMenuSelection={selected ? selected : undefined}
                // onContextMenuSelectionChange={e => setSelected(e.value)}
                onContextMenu={e => {contextMenu.current?.show(e.originalEvent); console.log('fgyh')}}
    
                selection={selected}
                onSelectionChange={e => {setSelected(e.value); contextMenu.current?.hide(e.originalEvent);}}

                scrollable scrollHeight={`calc(100vh - ${tabViewStore.deltaHeight}px)`}
                // scrollHeight={'flex'}            

                selectionMode="multiple" cellSelection

                stripedRows
                
                resizableColumns  columnResizeMode="fit"            
                
                // onSort={onSort} sortField={lazyParams.sortField} sortOrder={lazyParams.sortOrder}
                // filterMatchMode={}
                // onFilter={onFilter}      

                loading={query?.loading}
                showGridlines>
                    {query?.columns?.map((col, i) => {
                        return <Column 
                            key={i} field={col} header={col} 
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
