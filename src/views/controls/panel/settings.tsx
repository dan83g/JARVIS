import React, { useState, useEffect, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { Checkbox } from 'primereact/checkbox';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '../../../index';

export const SettingsPanel = observer(() => {    
    // const store = useRootStore();
    // store.userStore......
    const { userStore } = useRootStore()

    const op = useRef<OverlayPanel>(null);

    const optionTemplate = (option: any) => {
        return <div className="theme-option" id={option.value} title={option.value}/>
    }

    return (
        <div>
            <Button type="button" icon="pi pi-user" label={`${userStore.username}`}
                className="p-button-outlined select-product-button border-radius-10" 
                aria-haspopup aria-controls="overlay-panel"
                onClick={(e) => op.current?.toggle(e, null)}
            />
            <OverlayPanel ref={op} id="overlay-panel" style={{ width: "250px" }}>
                <label htmlFor="selection-theme">Тема</label>
                <SelectButton id="selection-theme" value={userStore.theme} options={userStore.themeOptions} onChange={(e: any) => userStore.updateTheme(e.value)} itemTemplate={optionTemplate}/>
            </OverlayPanel>
        </div>
    );
});