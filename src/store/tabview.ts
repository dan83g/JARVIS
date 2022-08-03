import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { User } from '../data/service';
import { Search, QueryParams } from '../data/service';
import { toast } from 'react-toastify';
import { Queries } from '../data/service';


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
        this.setDeltaHeight();
        makeAutoObservable(this);
    }

    // tabs
    loadQueries = async(params?: QueryParams, url?: string) => {
        try {
            let data = await Search.getQueries(params, url);
            this.setQueries(data);
            if (this.queries)
                this.executeQueries();
        } catch(error) {
            toast.error(`${error}`);                
        }
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

    setQueries = (data: Query[]): void => {
        this.queries = data.map((query: Query) => {
            let newQuery = Object.assign({}, query);
            newQuery.loading = true;
            return newQuery;   
        })
    }

    setQueryData = (queryId: string, data: any) => {
        this.queries = this.queries.map((query: Query) => {
            if (query.id === queryId){
                let newQuery = Object.assign({}, query);
                newQuery.data = data;
                newQuery.columns = data ? Object.keys(data[0]) : ['undefined'];
                return newQuery;
            }
            return query;
        });
    }

    setQueryLoading = (queryId: string, loading: boolean) => {
        this.queries = this.queries.map((query: Query) => {
            if (query.id === queryId){
                let newQuery = Object.assign({}, query);
                newQuery.loading = loading;
                return newQuery;  
            }
            return query
        })
    }

    executeQuery = async (queryId: string) => {        
        let query = this.getQuery(queryId);
        if (query) {
            try {
                let data = await Queries.getData(queryId);
                this.setQueryLoading(queryId, false);
                if (data && Array.isArray(data) && data.length > 0){
                    this.setQueryData(queryId, data);
                }
            } catch(error) {
                this.setQueryLoading(queryId, false);
                toast.error(`${error}`);                
            }
        }
    }
}