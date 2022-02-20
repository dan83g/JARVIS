import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { User } from '../data/service';
import { toast } from 'react-toastify';
import { Queries } from '../data/service';


// class Query {
//     id: string;
//     title: string;    
//     icon: string;
//     iframe: boolean;
//     loading: boolean = true;
//     columns?: string[] = ['id']
//     data?: Object[] = undefined;

//     constructor(id: string, title: string, icon: string, iframe: boolean) {
//         this.id = id;
//         this.title = title;
//         this.icon = icon;
//         this.iframe = iframe;
//         this.execute();
//     }

//     execute = () => {
//         let callbackSuccess = (data: any) => {
//             this.loading = false;
//             this.data = data;            
//             this.setColumns();
//         }
//         let callbackError = (error: any) => {
//             this.loading = false;
//             toast.error(error);
//         }
//         Queries.execute(this.id, callbackSuccess.bind(this), callbackError.bind(this));
//     }

//     setColumns() {
//         this.columns = this.data ? Object.keys(this.data[0]) : ['undefined'];
//     }    
// }

interface Query {
    id: string;
    title: string;    
    icon: string;
    iframe: boolean;
    loading?: boolean;
    columns?: string[];
    data?: Object[];
}

export class TabViewStore {
    root: RootStore;
    deltaHeight: number = 200;
    queries: Query[] = [];
    activeIndex: number = 0;

    constructor(root: RootStore) {
        this.root = root;
        this.loadQueries();
        this.setDeltaHeight();
        this.executeQueries();
        makeAutoObservable(this);
    }

    // tabs
    loadQueries() {
        let queries = [
            {
                id: 'cb39ea6f356670042db23c87ffe29758',
                title: 'cars',
                icon: 'calendar',
                iframe: false
            },
            {
                id: '604277792746b064fcfb35908d7d894b',
                title: 'sqlite3',
                icon: 'calendar',
                iframe: false
            }
        ]

        this.queries = queries.map((query: Query) => {
            query.loading = true;
            // query.columns = ['undefined'];
            return query;            
        })
    }

    executeQueries() {
        for (let query of this.queries) {
            this.executeQuery(query.id);
        }
    }

    setActiveTab = (index: number) => {
        if (index >=0 && this.queries.length > index){
            this.activeIndex = index;
            (document.querySelector(`.tabview-result a[itemID="${index}"]`) as HTMLLinkElement)?.focus();
        }
    }

    setDeltaHeight = () => {
        let elTabview = document.querySelector(`.p-tabview-panels`) as HTMLElement;
        let elErrors = document.querySelector(`.errors`) as HTMLElement;
        if (elTabview && elErrors) 
            this.deltaHeight = elTabview.getBoundingClientRect().top + elErrors.getBoundingClientRect().height;
    }

    onTabKeyDown = (index: number, code: string) => {        
        const variants: Record<string, number> = {
            'ArrowLeft': index - 1,
            'ArrowRight': index + 1,
            'Enter': index
        }
        this.setActiveTab(variants[code])
    }

    removeTab = (index: number) => {
        this.queries.splice(index, 1);
        this.setActiveTab(index-1);
    }

    getQuery = (queryId: string) => {
        return this.queries.find(q => q.id === queryId);
    }

    setQueryData = (queryId: string, data: any) => {
        this.queries = this.queries.map((query: Query) => {
            if (query.id == queryId)
                query.data = data
                query.columns = query.data ? Object.keys(query.data[0]) : ['undefined'];                
            return query
        })      
    }

    setQueryLoading = (queryId: string, loading: boolean) => {
        this.queries = this.queries.map((query: Query) => {
            if (query.id == queryId)
                query.loading = loading
            return query
        })
    }

    executeQuery = (queryId: string) => {        
        let query = this.getQuery(queryId);

        let callbackSuccess = (data: any) => {
            if (query){
                this.setQueryLoading(queryId, false);
                this.setQueryData(queryId, data);
            }
        }
        let callbackError = (error: any) => {
            if (query){
                this.setQueryLoading(queryId, false);
                toast.error(error);
            }
        }
        Queries.execute(queryId, callbackSuccess.bind(this), callbackError.bind(this));
    }
}