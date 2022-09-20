import React from 'react';
import { Button } from 'primereact/button';
import { Ripple } from 'primereact/ripple';
import { Dropdown } from 'primereact/dropdown';


export const BestPaginatorTemplate = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport',
    'PageLinks': (options: any) => {
        if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
            return <span className='user-select'>...</span>;
        }

        return (
            <button type="button" className={options.className} onClick={options.onClick}>
                {options.page + 1}
                <Ripple />
            </button>
        )
    },
    'RowsPerPageDropdown': (options: any) => {
        const dropdownOptions = [
            { label: 10, value: 10 },
            { label: 50, value: 50 },
            { label: 100, value: 100 },
            { label: 200, value: 200 },
            { label: 500, value: 500 },
            // { label: 'Все', value: options.totalRecords }
        ];

        return <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange}/>;
    }
};