import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Menu } from './slidemenu';
import { FormControl } from './form';{}

export const MainToolbar = () => {

    const leftContents = (
        <React.Fragment>
            <Menu/>
        </React.Fragment>
    );

    return (        
        <Toolbar className='index_toolbar' left={leftContents} />
    );
}