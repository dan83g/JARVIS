import * as jQuery from 'jquery';
(window as any).jQuery = jQuery;

// tablesorter
require('./tablesorter/jquery.tablesorter.js');
require('./tablesorter/jquery.tablesorter.widgets.js');
require('./tablesorter/widget-output.js');

// css
require('./tablesorter/tablesorter.css');
require('../style.css');

import {CONFIG, main_menu, menu_button, set_user_label} from '../general/index';
import {tab_view, runAllQueries} from './controls';
import {search} from './func';

class SearchPage {
    public server_data: any;    

    constructor(server_data: any){
        this.server_data = server_data;
    }
    init(): void {
        // init search function globally
        (window as any).search = search;
        // custom scroll
        // webix.CustomScroll.init();
        // render main menu
        const main_menu: webix.ui.layout = this.render_main_menu();
        // render controls 
        const main_view: webix.ui.layout = this.render_main();
        // set user to label
        set_user_label($$('labelUser') as webix.ui.label, CONFIG);
        // run all queries
        runAllQueries();
    }
    toolbar_view(): any {
        return {                
            view: "toolbar",
            id: "toolbar",                  
            height: 35,
            cols: [     
                {cols: [menu_button(CONFIG), {}], },
                {},  
                // query type
                {view:"label", label: "<span class='fas fa-search header_label'> " + this.server_data.typename + (this.server_data.value == '' ? " : " + this.server_data.value : '')+ "</span>", width: 500, align: 'center'},
                {},
                // user label
                { view: "label", id: "labelUser", align: "right"},
            ]
        }
    }
    tabs_view(): any {
        let tab_cells = [];
        this.server_data.queries.forEach(function(item){
            tab_cells.push(
                tab_view(item.name, item.id, item.iframe, item.icon_tag)
            )
        });

        if (tab_cells.length == 0)
            tab_cells.push({
                header: "Ошибка",
                body: {
                    view:"label", height:500, label: `<span class='fas fa-ghost fa-2x'><font color=#F96D4F>${this.server_data.error}</font></span>`,
                }
            })
        return tab_cells;
    }
    render_main_menu(): webix.ui.layout {  
        return webix.ui(main_menu(CONFIG)) as webix.ui.layout;
    }
    render_main(): webix.ui.layout {
        return webix.ui({
            padding: 0,
            margin: 0,
            css: `${CONFIG.skin} webix_padding_0`,
            rows: [                               
                this.toolbar_view(),
                {
                    gravity: 3,
                    view: "tabview",                
                    id: 'tabview',
                    cells: this.tabs_view(),
                    tabbar: {
                        height: 32,
                        id: 'tabs',                    
                        tabMinWidth: 80,
                        optionWidth: 120,
                        tabMargin: 2,
                    },
                    multiview: {keepViews: true},
                    on: {
                        onViewShow: function(){
                            ($$('tabview') as webix.ui.tabview).adjust();
                        }
                    }
                },
                {
                    margin: 0,
                    header:"<i class='fas fa-info' style='margin-top: 8px;'> Ошибки</span>",
                    headerHeight: 32,
                    collapsed: !CONFIG.errors_visible,
                    scroll: "y",
                    body:{                                
                        view:"list",
                        id: "log",                        
                        template:"#message#",
                        type: { 
                            height: 28
                        }
                    }
                }                  
            ]
        }) as webix.ui.layout;
    }
}

// retrieve from html js
declare var server_data: any;
// init SearchPage
const search_page = new SearchPage(server_data);
// init
search_page.init();
