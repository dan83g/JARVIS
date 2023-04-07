import React, { useState, useEffect } from 'react';
import PrimeReact from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
// import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { FormControl } from './views/form';
import { MainToolbarControl } from './views/controls/toolbar/main';
import { ErrorsControl } from './views/controls/panel/log';
import { SettingsPanel } from './views/controls/panel/settings'
import { TabViewControl } from './views/controls/tabview/tabview';
import { Logo } from './views/controls/logo/logo';
import { search } from './lib/navigate';


import './App.css';

export const IndexPage = () => {    
    return (
        <div className="app">
            <ToastContainer position="bottom-right"/>
            <div className="app-header">
                <div className='mt-2 ml-2'>
                    <Logo/>
                </div>
                <div className='search-form'>
                    <FormControl/>
                </div>
                <div className='mt-3 mr-3'>
                    <SettingsPanel/>
                </div>
            </div>
            <div className='flex-grow-1'>
                <TabViewControl/>
            </div>
            <div className='mb-0'>
                <ErrorsControl/>
            </div>
        </div> 
    )
}

export const LoginPage = () => {
    return (
        <div className="App">
            <MainToolbarControl />
        </div> 
    )
}

function App() {
    PrimeReact.ripple = true;

    // // append navigate function for secondary search    
    // (window as any).search = search;

    return <IndexPage/>;
    // return (
    //     <Router>
    //         <ToastContainer />
    //         <Routes>
    //             <Route path='/' element={ <IndexPage/> } />
    //             <Route path='/login' element={ <LoginPage/> } />
    //         </Routes>
    //     </Router>
    // );
}

export default App;
