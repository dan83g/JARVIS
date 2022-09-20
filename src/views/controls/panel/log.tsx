import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../index';
import { ListBoxLog } from '../listbox/listbox';
import { animationSpeed } from '../anumation/properties'
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import { Ripple } from 'primereact/ripple';
import { Button } from 'primereact/button';

    
export const ErrorsControl = observer(() => {
    const { userStore, tabViewStore } = useRootStore();

    const onToggle = (event: any) => {
        userStore.setErrors(!event.value);
        setTimeout(tabViewStore.setDatatableHeight, 50);
    }

    const headerTemplate = (options: PanelHeaderTemplateOptions) => {
        const toggleIcon = options.collapsed ? 'pi pi-chevron-up' : 'pi pi-chevron-down';
        const className = `${options.className} justify-content-start`;
        const titleClassName = `${options.titleClassName} pl-1`;

        return (
            <div className={className}>
                <Button className={options.togglerClassName} onClick={options.onTogglerClick}>
                    <span className={toggleIcon}/>
                    <Ripple />
                </Button>
                <span className={titleClassName}> Лог</span>
            </div>
        )
    }    

    return (
        <Panel className='errors'
            toggleable={true}
            collapsed={!userStore.errors}
            style={{textAlign: "left"}}
            onToggle={onToggle}
            headerTemplate={headerTemplate}
            transitionOptions={animationSpeed(0)}
            >
                <ListBoxLog className='error-log' options={tabViewStore.allLogErrors} filter filterBy='title,message'/>
        </Panel>        
        // <Fieldset className='errors' legend={<React.Fragment><span> Ошибки</span></React.Fragment>}    
        //     toggleable={true} collapsed={!userStore.errors} style={{textAlign: "left"}}
        //     onToggle={onToggle}
        //     transitionOptions={animationSpeed(0)}
        //     >
        //         <ListBoxLog className='error-log' options={tabViewStore.allLogErrors} filter filterBy='title,message'/>
        // </Fieldset>        
    )
})