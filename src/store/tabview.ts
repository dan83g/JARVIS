import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { Search, Queries, IQueriesParams, IQueryParams } from '../data/service';
import { toast } from 'react-toastify';
import { LogOption, LogType } from '../views/controls/listbox/listbox';


export const REFRESH_OPTIONS = [
    {label: 'Нет', value: 0},
    {label: '10 с', value: 10000},
    {label: '30 с', value: 30000},
    {label: '1 мин', value: 60000},
    {label: '5 мин', value: 300000}
];
export const DEFAULT_REFRESH_OPTION = 0;
export const DEFAULT_PAGING_LIMIT = 100;
export const DEFAULT_PAGING_OFFSET = 0;
export const DEFAULT_DATATABLE_HEIGHT = 200;

export interface IUrl {
    url: string;
}

export interface IQuery {
    id: string;
    title: string;    
    icon: string;    
    iframe: boolean;
    log?: LogOption;
    loading?: boolean;
    columns?: string[];
    data?: Object[];
    url?: string;
    refreshInterval: number;
    timerId?: number;
    value?: string;
    limit?: number;
    offset?: number;
}

export class TabViewStore {
    root: RootStore;
    datatableHeight: number = DEFAULT_DATATABLE_HEIGHT;
    queries: IQuery[] = [];
    activeIndex: number = 0;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    // tab
    setActiveTab = (index: number) => {
        // if (index >=0 && this.queries.length > index){
        if (index >=0 && this.successQueries.length > index){
            this.activeIndex = index;
            (document.querySelector(`.tabview-result a[itemID="${index}"]`) as HTMLLinkElement)?.focus();
        }
    }
    removeTab = (index: number) => {
        this.queries.splice(index, 1);
        this.setActiveTab(index-1);
    }    
    onTabKeyDown = (index: number, code: string) => {
        let circleCalcIndex = (index: number, maxIndex: number): number => {
            if (index > maxIndex) return 0
            if (index < 0) return maxIndex
            return index 
        }
        const variants: Record<string, number> = {
            'ArrowLeft': circleCalcIndex(index - 1, this.successQueries.length - 1),
            'ArrowRight': circleCalcIndex(index + 1, this.successQueries.length - 1),
            'Enter': circleCalcIndex(index + 1, this.successQueries.length - 1),
            'Space': circleCalcIndex(index + 1, this.successQueries.length - 1),
            'Home': 0,
            'End': this.successQueries.length - 1
        }
        this.setActiveTab(variants[code])
    }

    // datatableHeight
    get getDatatableHeight(): number  {
        let elTabview = document.querySelector(`.p-tabview-panels`) as HTMLElement;
        let elErrors = document.querySelector(`.errors`) as HTMLElement;
        if (elTabview && elErrors) {
            return elTabview.getBoundingClientRect().top + elErrors.getBoundingClientRect().height;
        }
        return DEFAULT_DATATABLE_HEIGHT;
    }     
    setDatatableHeight = (height?: number) => {
        this.datatableHeight = height ? height : this.getDatatableHeight;
    }   

    // Queries
    setQueries = (queries?: IQuery[]): void => {
        if (queries) this.queries = queries;
    }    

    // Query functions
    getQuery = (queryId: string): IQuery | undefined => {
        return this.queries.find(q => q.id === queryId);
    }

    assignQuery = (queryId: string, params: Partial<IQuery> = {}): IQuery[] =>  {
        return this.queries.map((query: IQuery) => {
            if (query.id === queryId) {
                return Object.assign({}, query, params);
            }
            return query
        })
    }
    setQueryLog = (queryId: string, log: LogOption, loading: boolean): void => {
        let queries: IQuery[] = this.assignQuery(queryId, {log: log, loading: loading, data: []} as Partial<IQuery>);
        this.setQueries(queries);
    }     
    setQueryData = (queryId: string, data: any, limit: number, offset: number): void => {
        let queries: IQuery[] = this.assignQuery(
            queryId, 
            {
                loading: false,
                data: data,
                columns: data && Array.isArray(data) ? Object.keys(data[0]) : ['undefined'],
                iframe: data && data.url ? true : false,
                url: data && data.url ? data.url : '',
                limit: limit,
                offset: offset,
                log: undefined,
            } as IQuery
        );
        this.setQueries(queries);        
    }    
    setQueryLoading = (queryId: string, loading: boolean): void => {
        let queries: IQuery[] = this.assignQuery(queryId, {loading: loading} as IQuery);
        this.setQueries(queries);
    }
    setQueryRefreshInterval = (queryId: string, refreshInterval: number, timerId: number=0): void => {
        let queries: IQuery[] = this.assignQuery(queryId, {refreshInterval: refreshInterval, timerId: timerId} as IQuery);
        this.setQueries(queries);        
    }
    setQuerySearchValue = (queryId: string, value: string): void => {
        let queries: IQuery[] = this.assignQuery(queryId, {value: value} as IQuery);
        this.setQueries(queries);        
    }     
    setQueryPaging = (queryId: string, limit: number, offset: number): void => {
        let queries: IQuery[] = this.assignQuery(queryId, {limit: limit, offset: offset} as IQuery);
        this.setQueries(queries);        
    }
    setLogOption = (title: string, type: LogType, message: string): LogOption => {
        return {title: title, type: type, message: message} as LogOption;
    }

    // waiting ms
    asyncTimeout = (ms: number) => {
        let timerId;
        const promise = new Promise(resolve => {timerId = setTimeout(resolve, ms);});    
        return {timerId, promise};
    };    

    // query refreshing
    refreshQuery = async (queryId: string, refreshInterval: number): Promise<void> => {
        let query = this.getQuery(queryId);
        if (query) {        
            if (refreshInterval === 0) {
                clearTimeout(query.timerId);
                this.setQueryRefreshInterval(query.id, refreshInterval, -1);
            } else if (refreshInterval !== query.refreshInterval) {
                clearTimeout(query.timerId);
            };
            if (refreshInterval > 0) {
                // getting timerId if we want to stop timer immedietly
                let { timerId, promise } = this.asyncTimeout(refreshInterval);
                // setting timerId and refreshInterval
                this.setQueryRefreshInterval(query.id, refreshInterval, timerId);                
                // waiting for refresh interval to execute query after
                await promise;
                // executing query
                await this.executeQuery(query.id, query.value, query.limit, query.offset);
                // executing again
                this.refreshQuery(queryId, refreshInterval);
            };
        }
    }
    // , refreshInterval: number = DEFAULT_REFRESH_OPTION
    executeQuery = async (queryId: string, value: string = "", limit: number = DEFAULT_PAGING_LIMIT, offset: number=DEFAULT_PAGING_OFFSET): Promise<void> => {
        let query = this.getQuery(queryId);
        if (query) {
            if (query.loading === false) {
                this.setQueryLoading(query.id, true);
            }
            try {
                let data = await Queries.getData({id: queryId, value: value, limit: limit, offset: offset} as IQueryParams);
                if (data && Array.isArray(data) && data.length > 0) {
                    // if data is present (datatable)
                    this.setQueryData(queryId, data, limit, offset);
                } else if (data && data.url){
                    // if url is present (iframe)
                    this.setQueryData(queryId, data, limit, offset);
                } else {
                    this.setQueryLog(queryId, this.setLogOption(query.title, LogType.Nodata, `Нет данных`), false);                    
                }
            } catch(error) {
                this.setQueryLog(queryId, this.setLogOption(query.title, LogType.Error, `${error}`), false);
            }
        }
        // return queryId;
    }
    executeQueries() {
        for (let query of this.queries) {
            this.executeQuery(query.id);
        }
    } 
    parseQueries = (data: any): IQuery[] | undefined => {
        if (Array.isArray(data)) {
            return data.map((query: IQuery) => {
                let q = Object.assign({}, query);
                q.loading = true;
                q.refreshInterval = DEFAULT_REFRESH_OPTION;
                q.limit = DEFAULT_PAGING_LIMIT;
                q.offset = 0;
                q.refreshInterval = 0;
                return q;   
            })
        }
    }       
    loadQueries = async(params?: IQueriesParams) => {
        try {
            let data: any = await Search.getQueries(params);
            let queries: IQuery[] | undefined = this.parseQueries(data);
            this.setQueries(queries);
            if (this.queries)
                this.executeQueries();
        } catch(error) {
            toast.error(`${error}`);
        }
    }

    get QueriesCount(): number {
        return this.queries.length;
    }
    get successQueries(): IQuery[] {
        return this.queries.filter((query: IQuery) => {
            // if secondary search do not delete query
            if (query.value) return true;
            // if no log
            if (query.log === undefined) return true;
            // if log type equels 'error' or' nodata'
            if (query.log?.type !== LogType.Error && query.log?.type !== LogType.Nodata) return true;
            // other
            return false;
        })        
    }
    get allLogErrors(): LogOption[] {
        let queriesWithErors: IQuery[] | undefined = this.queries.filter((query: IQuery) => {
            return (query.log?.type === LogType.Nodata || query.log?.type === LogType.Error) ? true : false;
        })
        let errors = queriesWithErors.map((query: IQuery) => {
            return query.log as LogOption;
        })
        return errors
    }    
}