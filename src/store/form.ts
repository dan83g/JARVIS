import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { SearchTypes } from '../data/service';
import { toast } from "react-toastify";

export class FormStore {
    root: RootStore;

    advancedVisibility?: boolean = false;
    searchText?: string = '';
    searchTextButtonVisibility?: boolean = false;
    typeValue?: string = ''
    dateFrom?: Date = undefined;
    dateTo?: Date = undefined;

    dateFilterValue?: string = ''
    dateRange?: Date | Date[] | undefined = undefined;

    typesData?: string[] = [];
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
    }

    loadSearchTypes = () => {
        let callback = (data: any) => {
            // добавляем первый элемент
            for (var idx in data){
                data[idx].name = data[idx].typename;
                // data[idx].code = data[idx].id;
            }
            this.setTypesData(data);
        }
        SearchTypes.list(
            callback.bind(this),
            (error) => toast.error(error)
        );
    }

    setAdvancedVisibility = (value: boolean) => {
        this.advancedVisibility = value
    }

    // type
    setTypesData = (data: string[]) => {
        this.typesData = data
    }
    
    setTypeValue = (type: string) => {
        this.typeValue = type
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

    setDateRange = (range: Date | Date[] | undefined) => {
        this.dateRange = range
    }

    onChangeSearchText = (value: string) => {
        if (value) 
            this.searchTextButtonVisibility = true;
        else 
            this.searchTextButtonVisibility = false;
        this.searchText = value;
    }    

    onFormSubmit = (e:any) => {
        if (this.searchText) {
            toast.info(`${this.searchText} ${this.typeValue} ${this.dateRange}`, {})
        }
        e.preventDefault();
    }

    onClearClick = () => {
        this.onChangeSearchText("");
        this.typeValue = "";
        this.dateFilterValue = "";
    }    

}