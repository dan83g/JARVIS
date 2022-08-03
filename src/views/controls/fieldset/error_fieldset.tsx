import React, { useState } from 'react';
import { Fieldset } from 'primereact/fieldset';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../index';

    
export const ErrorsControl = observer(() => {
    const { userStore, tabViewStore } = useRootStore();

    return (
        <Fieldset className='errors' legend={<React.Fragment><span> Ошибки</span></React.Fragment>}
            toggleable={true} collapsed={!userStore.errors} style={{textAlign: "left"}}
            onToggle={(e) => userStore.setErrors(!e.value)}
            onCollapse={(e) => setTimeout(tabViewStore.setDeltaHeight, 300)}
            onExpand={(e) => setTimeout(tabViewStore.setDeltaHeight, 300)}>            
            <p>Errors must be here</p>
        </Fieldset>        
    )
})