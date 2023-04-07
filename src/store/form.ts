import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { Search, SearchTypes, IQueriesParams } from '../data/service';
import { toast } from "react-toastify";
import { b64DecodeUnicode } from '../lib/code';
import { MenuItem, MenuItemCommandEvent } from 'primereact/menuitem/menuitem';


// SearchInfo
interface ISearchInfo {
    typename?: string;
    autocomplete: string[];
}
export class SearchInfo implements ISearchInfo {
    searchText?: string = undefined;
    typename?: string = undefined;
    autocomplete: any = [];

    constructor(params: Partial<SearchInfo> = {}) {
        Object.assign(this, params);
    }
    
    loadSearchInfo = async (): Promise<ISearchInfo> => {
        try {            
            let data = await Search.valueInfo(this.searchText);
            return data ? (data as ISearchInfo) : (this as ISearchInfo);
        } catch(error) {
            throw new Error(`${error}`)
        }
    }
}

// menuitem interface
type IMenuItem = Pick<MenuItem, 'label' | 'icon'  | 'command'>
export class MenuItemEx implements IMenuItem {
    label?: string;
    icon?: any;
    command?(event: MenuItemCommandEvent): void;  

    constructor(item: IMenuItem) {
        this.label = item.label;
        this.icon = item.icon;
        this.command = item.command;
    }
}

// FormStore class
export class FormStore {
    root: RootStore;

    advancedVisibility?: boolean = false;
    searchText?: string = '';
    dateFrom?: Date = undefined;
    dateTo?: Date = undefined;

    dateFilterValue?: string = ''
    // dateRange?: Date | Date[] | undefined = undefined;
    dateRange?: Date[] | undefined = undefined;

    typeValue?: string = '';
    typesList: string[] = [];
    // typesMenuOptions: any[] = [];

    autoCompleteList?: string[] = [];

    dateFilterOptions = [
        {name: "За сутки", id: "day", getRangeStart: (end: Date) => {return new Date(end.setDate(end.getDate()-1))}},
        {name: "За неделю", id: "week", getRangeStart: (end: Date) => {return new Date(end.setDate(end.getDate()-7))}},
        {name: "За 2 недели", id: "2week", getRangeStart: (end: Date) => {return new Date(end.setDate(end.getDate()-14))}},
        {name: "За месяц", id: "month", getRangeStart: (end: Date) => {return new Date(end.setMonth(end.getMonth()-1))}},
        {name: "За полугодие", id: "halfyear", getRangeStart: (end: Date) => {return new Date(end.setMonth(end.getMonth()-6))}},
        {name: "За год", id: "year", getRangeStart: (end: Date) => {return new Date(end.setFullYear(end.getFullYear()-1))}},
        {name: "Период...", id: "custom", getRangeStart: (end: Date) => {return end}},
    ]    

    constructor(root: RootStore, initialState?: any) {
        this.root = root
        makeAutoObservable(this);

        this.loadSearchTypes();

        // this.loadQueryParams();
        this.loadInitialState(initialState);

        // todo: if query exists in get parameters
        // if (this.searchText) {
        //     root.tabViewStore.loadQueries(undefined, `${ window.location.pathname}${ window.location.search}`);
        // }
    }

    // loading data
    loadQueryParams = () => {
        let search = window.location.search;
        const urlParams = new URLSearchParams(search);
        if (urlParams.has('value')){
            let value = urlParams.get('value');
            if (value && urlParams.has('base64') && urlParams.get('base64') === '1')                
                value = b64DecodeUnicode(value);

            if (value) {
                this.setSearchText(`${value}`)
            }
        }
    }
    loadSearchTypes = async () => {
        try {
            let data = await SearchTypes.getList();
            this.setTypesList(data.map((type:any) => type.typename));
        } catch(error) {
            toast.error(`${error}`);                
        }
    }
    loadInitialState = (initialState: any) => {
        let search = window.location.search;
        const urlParams = new URLSearchParams(search);
        if (urlParams.has('value')){
            let value = urlParams.get('value');
            if (value && urlParams.has('base64') && urlParams.get('base64') === '1')                
                value = b64DecodeUnicode(value);

            if (value) {
                this.setSearchText(`${value}`)
            }
        }
    }    

    setAdvancedVisibility = (value: boolean) => {
        this.advancedVisibility = value
    }

    // type
    setTypesList = (list: string[]) => {
        this.typesList = list;
    }
    setTypeValue = (type?: string) => {
        this.typeValue = type;
    }
    setAutoCompleteList = (autoCompleteList?: string[]) => {
        if (autoCompleteList && autoCompleteList.length > 0) {
            this.autoCompleteList = autoCompleteList;
        }
    }
    setSearchInfo = async (searchText?: string, isSetType: boolean = true): Promise<void> => {
        let info = await new SearchInfo({searchText: searchText}).loadSearchInfo();
        if (info) {
            if (isSetType === true) {
                this.setTypeValue(info.typename);
            }
            this.setAutoCompleteList(info.autocomplete);
        }
    }  

    get TypesMenuOptions() {
        return this.typesList.map((type: string) => {
            return new MenuItemEx({
                label: type,
                icon: 'pi pi-fw pi-check',
                command:()=>this.setTypeValue(type)
            } as IMenuItem)
        })
    }

    // date
    setDateFilterValue = (dateFilter: string) => {
        this.dateFilterValue = dateFilter;
        if (dateFilter !== "custom"){
            let filterOption = this.dateFilterOptions.filter(x => x.id === dateFilter).pop()
            let rangeStart = filterOption?.getRangeStart(new Date());
            this.setDateRange([rangeStart ? rangeStart : new Date(), new Date()]);
        }
    }
    setDateRange = (range: Date[] | undefined) => {
        this.dateRange = range
    }
    setSearchText = (value: string) => {
        this.searchText = value;
    }    

    onFormSubmit = (e: any) => {
        e.preventDefault();
        if (this.searchText) {
            let params: IQueriesParams = {
                value: this.searchText,
                typename: this.typeValue,
                date_from: this.dateRange ? this.dateRange[0] : undefined,
                date_to: this.dateRange ? this.dateRange[1] : undefined,
            }
            this.root.tabViewStore.loadQueries(params);
        }        
    }

    onClearClick = () => {
        this.setSearchText("");
        this.typeValue = "";
        this.dateFilterValue = "";
    }    

}