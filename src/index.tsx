import React from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RootStore } from './store/root';

// mobx store configuration
let store: RootStore

// create the context
const StoreContext = React.createContext<RootStore | undefined>(undefined);

// create the provider component
function RootStoreProvider({ children }: { children: React.ReactNode }) {
    //only create the store once ( store is a singleton)
    store = store ?? new RootStore()
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

// create the hook
export function useRootStore() {
    const context = React.useContext(StoreContext)
    if (context === undefined) {
        throw new Error("useRootStore must be used within RootStoreProvider")
    }
    return context
}

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RootStoreProvider>
            <App />
        </RootStoreProvider>        
    </React.StrictMode>
);

reportWebVitals();