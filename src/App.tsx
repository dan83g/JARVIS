import React, { useState, useEffect } from 'react';
import PrimeReact from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { FormControl } from './views/form';
import { MainToolbarControl } from './views/controls/toolbar/main';
import { Image } from 'primereact/image';
import { ErrorsControl } from './views/controls/fieldset/error_fieldset';
import { SettingsPanel } from './views/controls/panel/settings'
import { TabViewControl } from './views/controls/tabview/tabview';
import { Logo } from './views/controls/logo/logo';


import './App.css';

export const IndexPage = () => {    
    return (
        <div className="app">
            <ToastContainer />
            <div className="app-header">
                <div style={{flexBasis: "130px", marginTop: "0.75rem", marginLeft: "0.75rem"}}>
                    <Logo/>
                </div>
                <div style={{flexBasis: "700px"}}>
                    <FormControl/>
                </div>
                <div style={{marginTop: "0.75rem", marginRight: "0.75rem"}}>
                    <SettingsPanel/>
                </div>
            </div>
            <div style={{flexGrow: 1}}>
                <TabViewControl/>
            </div>
            <div style={{marginBottom: "0rem"}}>
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
