import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { SearchTypes, QueryParams } from '../data/service';
import { toast } from "react-toastify";
import { b64DecodeUnicode } from '../data/code';

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
    typesList?: string[] = [];
    typesMenuOptions?: any[] = [];

    dateFilterOptions = [
        {name: "За сутки", id: "day", getRangeStart: (end: Date) => {return new Date(end.setDate(end.getDate()-1))}},
        {name: "За неделю", id: "week", getRangeStart: (end: Date) => {return new Date(end.setDate(end.getDate()-7))}},
        {name: "За 2 недели", id: "2week", getRangeStart: (end: Date) => {return new Date(end.setDate(end.getDate()-14))}},
        {name: "За месяц", id: "month", getRangeStart: (end: Date) => {return new Date(end.setMonth(end.getMonth()-1))}},
        {name: "За год", id: "year", getRangeStart: (end: Date) => {return new Date(end.setFullYear(end.getFullYear()-1))}},
        {name: "Период...", id: "custom", getRangeStart: (end: Date) => {return end}},
    ]    

    constructor(root: RootStore) {
        this.root = root
        makeAutoObservable(this);

        this.loadSearchTypes();

        this.loadQueryParams();

        if (this.searchText) {
            root.tabViewStore.loadQueries(undefined, `${ window.location.pathname}${ window.location.search}`);
        }
    }

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

    detectSearchType = async (value: string) => {
        try {
            let data = await SearchTypes.detect(value);
            if (data && data.typename)
                this.setTypeValue(data.typename);
        } catch(error) {
            toast.error(`${error}`);                
        }
    }    

    setAdvancedVisibility = (value: boolean) => {
        this.advancedVisibility = value
    }

    // type
    setTypesList = (list: string[]) => {
        this.typesList = list;
        console.log(list);
        this.setTypesMenuOptions(list);
    }
    
    setTypeValue = (type: string) => {
        this.typeValue = type;
    }

    setTypesMenuOptions = (types: any[]) => {
        this.typesMenuOptions = types.map((type: string) => {
            return {
                label: type,
                icon: 'pi pi-fw pi-check',
                command:()=>this.setTypeValue(type)
            }
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
        if (value.length >4)
            this.detectSearchType(value);                    
    }    

    onFormSubmit = (e:any) => {
        e.preventDefault();
        if (this.searchText) {
            let params: QueryParams = {
                value: this.searchText,
                typename: this.typeValue,
                date_from: this.dateRange ? this.dateRange[0] : undefined,
                date_to: this.dateRange ? this.dateRange[1] : undefined,
            }
            // .toISOString()            
            this.root.tabViewStore.loadQueries(params);
            toast.info(`${this.searchText} ${this.typeValue} ${this.dateRange}`, {});
        }        
    }

    onClearClick = () => {
        this.setSearchText("");
        this.typeValue = "";
        this.dateFilterValue = "";
    }    

}