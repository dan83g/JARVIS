import { UserStore } from './user';
import { FormStore } from './form';
import { TabViewStore } from './tabview';

export class RootStore {
    userStore: UserStore;
    formStore: FormStore;
    tabViewStore: TabViewStore;

    constructor() {    
        this.userStore = new UserStore(this);
        this.formStore = new FormStore(this);
        this.tabViewStore = new TabViewStore(this);
    }
}