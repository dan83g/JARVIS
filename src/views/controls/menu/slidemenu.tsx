import React, { useRef } from 'react';
import { SlideMenu } from 'primereact/slidemenu';
import { Button } from 'primereact/button';

export const Menu = () => {
    const menu = useRef(null);
    const items = [
        {
            label: 'Домашняя страница',
            icon:'pi pi-fw pi-home',
            url: '/'
        },
        {
            label: 'dtSearch',
            icon:'pi pi-fw pi-search',
            url: '/'
        },
        {
            label: 'Карта',
            icon:'pi pi-fw pi-map',
            url: '/'
        },
        {
            label: 'Администрирование',
            icon:'pi pi-fw pi-cog',
            url: '/admin/'
        },
        {
            label: 'Настройки',
            icon:'pi pi-fw pi-user-edit',
            url: '/admin/'
        },
        {
            label:'Users',
            icon:'pi pi-fw pi-user',
            items:[
                {
                    label:'New',
                    icon:'pi pi-fw pi-user-plus',

                },
                {
                    label:'Delete',
                    icon:'pi pi-fw pi-user-minus',

                },
                {
                    label:'Search',
                    icon:'pi pi-fw pi-users',
                    items:[
                    {
                        label:'Filter',
                        icon:'pi pi-fw pi-filter',
                        items:[
                            {
                                label:'Print',
                                icon:'pi pi-fw pi-print'
                            }
                        ]
                    },
                    {
                        icon:'pi pi-fw pi-bars',
                        label:'List'
                    }
                    ]
                }
            ]
        },
        {
            separator:true
        },
        {
            label:'Quit',
            icon:'pi pi-fw pi-power-off'
        }
    ];

    return (
        <div>
            <div className="card">
                <SlideMenu ref={menu} model={items} popup viewportHeight={300} menuWidth={260}></SlideMenu>
                <Button type="button" icon="pi pi-bars" onClick={(event) => (menu.current as any).toggle(event)}></Button>
            </div>
        </div>
    );
}