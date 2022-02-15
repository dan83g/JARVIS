import './animation.css';
import '../style.css';
import {CONFIG, main_menu, menu_button} from '../general/index';
import {beam_animation} from './animation';

//инициализируем базовые настройки WEBIX
webix.Date.startOnMonday = true;
webix.i18n.dateFormat = "%d.%m.%Y";
webix.i18n.fullDateFormat = "%d.%m.%Y %H:%i";
webix.i18n.setLocale("ru-RU");

class IndexPage {
    init(): void {
        // custom scroll
        webix.CustomScroll.init();
        // menu button
        const menu_button: webix.ui.layout = this.createMenuButton();
        // main menu
        const main_menu: webix.ui.layout = this.createMainMenu();
        // controls 
        const controls: webix.ui.layout = this.createControls();
        // list control
        const list: webix.ui.list = (<webix.ui.list> webix.$$("list_type"));
        // get types
        var types: any = this.setTypes(list, "type.list");
        // focus on search element
        (<webix.ui.text> webix.$$("text_search")).focus();
        // beam animation
        setTimeout(beam_animation, 3000);         
    }
    createMenuButton(): webix.ui.layout {
        return <webix.ui.layout> webix.ui(
            menu_button(CONFIG)
        );
    }
    createMainMenu(): webix.ui.layout {  
        return <webix.ui.layout> webix.ui(
            main_menu(CONFIG)
        );
    }
    createControls(): webix.ui.layout {  
        return <webix.ui.layout> webix.ui({
            container: "webixtemplate",
            css: "webix_search " + CONFIG.skin,                    
            cols: [
                {width:560,                        
                    rows:[
                        {
                            view:"search",
                            icon:"wxi-search",                        
                            id:"text_search",
                            name:"value",
                            placeholder:"Введите текст для поиска", 
                            height:40,
                            on:{
                                onEnter:function(ev){
                                    let value = ($$("text_search") as webix.ui.text).getValue()
                                    if (!value) {
                                        webix.message("Введите текст для поиска", "error", 4000);
                                        return
                                    }

                                    // filter values
                                    let filter_values = {
                                        "value": value,
                                        "date_from": ($$("datepicker_from") as webix.ui.datepicker).getValue(),
                                        "date_to": ($$("datepicker_to") as webix.ui.datepicker).getValue(),
                                    }

                                    // получаем данные из list
                                    let selected_item = ($$("list_type") as webix.ui.list).getSelectedItem(false);                                
    
                                    //GET
                                    if (selected_item){                                        
                                        if (selected_item.id != "default")
                                            webix.send(`/search/${selected_item.title}/`, filter_values, "GET", "")
                                        else
                                            webix.send("/search/", filter_values, "GET", "")
                                    }
                                    else
                                        webix.message("Выберите параметры поиска", "error", 4000);
                                },
                                onSearchIconClick:function(){
                                    this.callEvent("onEnter");
                                }
                            },
    
                        },                                    
                        {height:2},
                        {
                            cols: [
                                {},
                                {
                                    view: "button", id: "btn_search", type: "htmlbutton", 
                                    width: 30, height: 24,
                                    label: "<span class='fas fa-caret-down'/>", 
                                    tooltip: "Дополнительные параметры", 
                                    click:function(id, event){
                                        let panel = webix.$$('filter_form');
                                        if (panel.config.hidden) panel.show();
                                        else panel.hide();
                                    }.bind(this)
                                }
                            ]
                        },
                        {
                            id:"filter_form",
                            hidden: true,
                            rows: [
                                {
                                    cols: [                                
                                        {
                                            view: "datepicker",
                                            id: 'datepicker_from',
                                            name: 'datepicker_from',
                                            stringResult: true,
                                            format: "%d.%m.%Y",
                                            inputWidth: 275,
                                            label: 'Период, с',
                                            labelWidth:75
                                        },
                                        {
                                            view:"datepicker",
                                            id: 'datepicker_to',
                                            name: 'datepicker_to',
                                            stringResult: true,
                                            format: "%d.%m.%Y",                                            
                                            inputWidth:275,
                                            label: 'Период, по',
                                            labelWidth:75
                                        }                                        
                                    ]
                                },
                                {height: 8},
                                {
                                    view: "list",
                                    id: "list_type",
                                    name:  "list_type",
                                    tooltip: "Выберите тип, если нужно уточнить запрос",
                                    height: 400,
                                    template: "#title#",
                                    select: true,
                                    type:{
                                        height: 28,
                                    },
                                    css: {"border-radius": "5px"},
                                },
                                {}
                            ]
                        }
                    ]
                },
            ]
        });
    }
    setTypes(list: webix.ui.list, url: string): void {
        let promise = webix.ajax().get(url, function(data: any){
            try {
                // парсим входящие данные
                let oJson = JSON.parse(data);
                // добавляем первый элемент
                for (var idx in oJson.data){
                    oJson.data[idx].title = oJson.data[idx].typename;
                }
                oJson.data.splice(0, 0, {id: "default", title: "Автоопределение"});

                list.parse(oJson, 'json');
                list.select(
                    String(list.getFirstId()),
                    false
                );                                
            }
            catch (e){
                webix.message( "Ошибка загрузки типов: " + e, "error", 5000);
            };
        })    
        promise.catch(function(err: any){   
            try {
                let oJson = JSON.parse(err.responseText);
                if (oJson && oJson.message){
                    webix.message( "Ошибка загрузки типов: " +  oJson.message, "error", 5000);                              
                }
            } catch (e) {            
                webix.message( "Ошибка загрузки типов: " + e, "error", 5000);                           
            }     
        });
    }
}

const index_page = new IndexPage();
// init
index_page.init();