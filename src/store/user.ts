import { makeAutoObservable } from 'mobx'
import { RootStore } from './root';
import { User } from '../data/service';
import { toast } from "react-toastify";
import { fullUrl } from '../data/http';


interface themeOption {
    value?: string;
    logoClass?: string;
}

const DEFAULT_THEME_OPTIONS: themeOption[] = [
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
const DEFAULT_DARK_THEME: string = 'vela-orange';
const DEFAULT_LIGHT_THEME: string = 'nova';

interface groupOption {
    id: number;
    name: string;
}

interface IUserSettings {
    username: string | null;
    last_name: string ;
    first_name: string;
    email: string;
    groups: groupOption[];
    last_login: string;
    theme: string;
    errors: boolean;
}

type IUserSettingsToSave = Pick<IUserSettings, 'theme' | 'errors'>

export class UserSettingsToSave implements IUserSettingsToSave {
    theme: string;
    errors: boolean;

    constructor(settings: IUserSettings) {
        this.theme = settings.theme;
        this.errors = settings.errors;
    }
}

export class UserStore {
    root: RootStore;

    username?: string | null = '';
    last_name?: string = '';
    first_name?: string = '';
    email?: string = '';
    groups?: groupOption[] = [];
    last_login?: string = '';
    theme?: string | null = 'vela-blue';
    errors?: boolean = false;

    themeOptions: themeOption[] = DEFAULT_THEME_OPTIONS;   

    constructor(root: RootStore) {
        this.root = root;
        this.initialLoad();
        this.loadSettings();
        makeAutoObservable(this);
    }

    initialLoad = () => {
        this.setDefaultTheme();
        // let rootElement = document.getElementById('root') as HTMLElement;
        // if (rootElement){
        //     this.username = rootElement.hasAttribute('username') ? rootElement.getAttribute('username') : this.username;
        //     this.theme = rootElement.hasAttribute('theme') ? rootElement.getAttribute('theme') : this.theme;
        // }
    }

    loadSettings = async () => {
        // load user settings from localstorage
        const localStorage = window.localStorage;
        let theme = localStorage.getItem('theme');
        if (theme && theme !== this.theme)
            this.updateTheme(theme);
        let errors = localStorage.getItem('errors');        
        if (errors)
            this.setErrors(errors === 'true');

        // load user info
        try {
            let userData = await User.getInfo();        
            this.setUserSettings(userData)
        } catch(error) {
            toast.error(`${error}`);                
        }        
    }

    saveUserSettings = async () => {
        let settings = new UserSettingsToSave(this as IUserSettings);
        try {
            await User.saveSettings(settings);
            toast.success('Настройки успешно сохранены')
        } catch(error) {
            toast.error(`${error}`);                
        }
    }

    setUserSettings = (settings: IUserSettings) => {
        Object.assign(this, settings);
    }

    setErrors = (errors: boolean) => {
        window.localStorage.setItem('errors', errors.toString())
        this.errors = errors;
    }

    setDefaultTheme = (): void => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches)
            this.updateTheme(DEFAULT_DARK_THEME);
        else
            this.updateTheme(DEFAULT_LIGHT_THEME);
    }

    setTheme = (theme: string) => {
        window.localStorage.setItem('theme', theme)
        this.theme = theme;
    }

    updateTheme = (theme: string) => {        
        let themeLink = document.getElementById('app-theme') as HTMLLinkElement;
        if (themeLink && theme) {
            themeLink.href = fullUrl(`static/themes/${theme}/theme.css`);
            this.setTheme(theme);
            setTimeout(this.root.tabViewStore?.setDatatableHeight, 1000);
        }
    }

    get logoClass() {
        return this.themeOptions.find(x => x.value === this.theme)?.logoClass ?? 'dark';
    }

}