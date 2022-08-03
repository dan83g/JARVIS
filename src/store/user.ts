import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { User } from '../data/service';
import { toast } from "react-toastify";
import { fullUrl } from '../data/http';


interface themeOption {
    value?: string;
    logoClass?: string;
}

export class UserStore {
    root: RootStore;
    username?: string | null = '';

    last_name?: string = '';
    first_name?: string = '';
    email?: string = '';
    groups?: string[] = [];
    last_login?: string = '';

    theme?: string | null = 'vela-blue';
    errors?: boolean = false;

    themeOptions: themeOption[] = [
        { value: 'arya-blue', logoClass: 'dark' },
        { value: 'arya-green', logoClass: 'dark' },
        { value: 'arya-orange', logoClass: 'dark' },
        { value: 'arya-purple', logoClass: 'dark' },
        { value: 'bootstrap4-light-blue',logoClass: 'light' },
        { value: 'bootstrap4-dark-blue', logoClass: 'dark' },
        { value: 'bootstrap4-light-purple', logoClass: 'light' },
        { value: 'bootstrap4-dark-purple', logoClass: 'dark' },
        { value: 'fluent-light', logoClass: 'light' },
        { value: 'luna-amber', logoClass: 'dark' },
        { value: 'luna-green', logoClass: 'dark' },
        { value: 'luna-blue', logoClass: 'dark' },
        { value: 'luna-pink', logoClass: 'dark' },                        
        { value: 'md-dark-deeppurple', logoClass: 'dark' },
        { value: 'md-dark-indigo', logoClass: 'dark' },
        { value: 'md-light-deeppurple', logoClass: 'light' },        
        { value: 'md-light-indigo', logoClass: 'light' },        
        { value: 'mdc-dark-deeppurple', logoClass: 'dark' },
        { value: 'mdc-dark-indigo', logoClass: 'dark' },
        { value: 'mdc-light-deeppurple', logoClass: 'light' },        
        { value: 'mdc-light-indigo', logoClass: 'light' },        
        { value: 'nova', logoClass: 'light' },
        { value: 'nova-accent', logoClass: 'light' },
        { value: 'nova-alt', logoClass: 'light' },
        { value: 'rhea', logoClass: 'light' },
        { value: 'saga-blue', logoClass: 'light' },
        { value: 'saga-green', logoClass: 'light' },
        { value: 'saga-orange', logoClass: 'light' },
        { value: 'saga-purple', logoClass: 'light' },
        { value: 'tailwind-light', logoClass: 'light' },
        { value: 'vela-blue', logoClass: 'dark' },
        { value: 'vela-green', logoClass: 'dark' },
        { value: 'vela-orange', logoClass: 'dark' },
        { value: 'vela-purple', logoClass: 'dark' },
    ];    

    constructor(root: RootStore) {
        this.root = root;
        this.initialLoad();
        this.loadSettings();
        makeAutoObservable(this);
    }

    initialLoad = () => {
        let rootElement = document.getElementById('root') as HTMLElement;
        if (rootElement){
            this.username = rootElement.hasAttribute('username') ? rootElement.getAttribute('username') : this.username;
            this.theme = rootElement.hasAttribute('theme') ? rootElement.getAttribute('theme') : this.theme;
        }
    }

    loadSettings = async () => {
        // load user settings from localstorage
        const localStorage = window.localStorage;
        let theme = localStorage.getItem('theme');
        if (theme && theme !== this.theme)
            this.setTheme(theme)
        let errors = localStorage.getItem('errors');        
        if (errors)
            this.setErrors(errors === 'true');

        // load user info
        // let userData = await User.loadSettings((data: any) => this.setUser(data), (error) => toast.error(error));
        try {
            let userData = await User.loadSettings();        
            this.setUser(userData)
        } catch(error) {
            toast.error(`${error}`);                
        }        
    }

    saveSettings = async () => {
        let data ={
            "theme": this.theme,
            "errors": this.errors
        }

        try {
            let _ = await User.saveSettings(data);
            toast.success('Настройки успешно сохранены')
        } catch(error) {
            toast.error(`${error}`);                
        }           

        // User.saveSettings(data, (data: any) => toast.success('Настройки успешно сохранены'), (error) => toast.error(error));
    }

    setUser = (data: any) => {
        this.username = data.username;
        this.last_name = data.last_name;
        this.first_name = data.first_name;
        this.email = data.email;
        this.last_login = data.last_login;
        this.groups = data.groups;
    }

    setErrors = (errors: boolean) => {
        window.localStorage.setItem('errors', errors.toString())
        this.errors = errors;
    }

    setTheme = (theme: string) => {
        window.localStorage.setItem('theme', theme)
        let themeLink = document.getElementById('app-theme') as HTMLLinkElement;
        if (themeLink && theme) {
            themeLink.href = fullUrl(`themes/${theme}/theme.css`);
            this.theme = theme;
            setTimeout(this.root.tabViewStore?.setDeltaHeight, 1000);
        }
    }

    get logoClass() {
        return this.themeOptions.find(x => x.value === this.theme)?.logoClass ?? 'dark';
    }

}