import React, { useState, useEffect } from 'react';
import PrimeReact from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { FormControl } from './views/form';
import { MainToolbar } from './views/toolbar';
import { Image } from 'primereact/image';
import { ErrorsControl } from './views/errors';
import { SettingsPanel } from './views/settings'
import { TabViewControl } from './views/tabview';
import { Logo } from './views/logo';


import './App.css';

export const IndexPage = () => {    
    return (
        <div className="app">
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
            <MainToolbar />
        </div> 
    )
}


function App() {
    PrimeReact.ripple = true;  

    return (
        <Router>
            <ToastContainer />
            <Routes>
                <Route path='/' element={ <IndexPage/> } />
                <Route path='/login' element={ <LoginPage/> } />
            </Routes>
        </Router>
    );
}

export default App;
