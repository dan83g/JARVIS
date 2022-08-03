import React from 'react';
import { SpeedDial } from 'primereact/speeddial';
import { Tooltip } from 'primereact/tooltip';


export const ThemeButton = () => {

    const changeTheme = (theme: string) => {
        let themeLink = document.getElementById('app-theme') as HTMLLinkElement;
        if (themeLink) {
          themeLink.href = `themes/${theme}/theme.css`;
        }
    }

    const items = [
        {
            label: 'Add',
            icon: 'pi pi-palette',
            command: () => {changeTheme('saga-blue')}
        },
        {
            label: 'Update',
            icon: 'pi pi-palette',
            command: () => {changeTheme('vela-blue')}
        }     
    ];

    return (
        <div>
            <div className="theme-div flex justify-content-end mt-3 mr-3" style={{position: "absolute", top: 0, right: 0}}>
                <Tooltip target=".theme-div .theme-button .p-speeddial-action" position="left"/>
                <SpeedDial model={items} direction="down" className='theme-button' buttonClassName="p-button-outlined" transitionDelay={30} showIcon="pi pi-cog" hideIcon="pi pi-times"/>
            </div>
        </div>
    )
}