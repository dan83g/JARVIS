import { UserStore } from './user';
import { FormStore } from './form';
import { TabViewStore } from './tabview';

export class RootStore {
    initialState?: any = undefined;
    userStore: UserStore;
    formStore: FormStore;
    tabViewStore: TabViewStore;

    constructor(initialState: any) {
        this.initialState = initialState;
        this.userStore = new UserStore(this);
        this.tabViewStore = new TabViewStore(this);
        this.formStore = new FormStore(this, initialState);
    }
}