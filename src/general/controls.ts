import {showWindowUserConfig} from './windows';

export function menu_button(CONFIG: any): any {
    return {        
        container: "menu",
        css: CONFIG.skin,
        cols: [
            {
                view: "button", 
                type: "htmlbutton",
                tooltip: "Показать/скрыть меню", 
                width: 38,
                label: "<span class='fas fa-bars'/>" ,                        
                click: function(){
                    if ($$("menu").config.hidden)
                        $$("menu").show();
                    else
                        $$("menu").hide();
                }
            }
        ]
    }
}

export function main_menu(CONFIG: any): any{
    return {
        view: "sidemenu",
        id: "menu",
        width: 250,
        zIndex:5001,
        css:"css_sidemenu",
        position: "left",                   
        state:function(state: any){
            var toolbarHeight = $$("toolbar") ? $$("toolbar").$height : 45;
            state.top = toolbarHeight;
            state.height -= toolbarHeight;
        },
        body:{
            rows:[         
                {height:5},

                {
                    view:"list",
                    borderless:true,
                    scroll: false,
                    type:{
                        height: 28,
                    },
                    template: "<span class='css_icon fas #icon# fa-lg'/> <font size='3'> #value#</font>",
                    data:[                                    
                        {id: "home", value: "Главная страница", icon: "fa-home"},
                        {id: "admin", value: "Админка", icon: "fa-cogs"},
                        {id: "settings", value: "Настройки", icon: "fa-user-cog"},
                        {id: "dtsearch", value: "dtSearch", icon: "fa-search"},
                        {id: "map", value: "Карта", icon: "fa-map"},
                    ],
                    on:{
                        onItemClick: function(id: string|number){
                        
                            switch (id){    
                                
                                case "home":{                                                
                                    webix.send("/", null, "GET", "")
                                    break;
                                } 

                                case "admin":{                                                
                                    webix.send("/admin/", null, "GET", "")
                                    break;
                                } 

                                case "settings":{ 
                                    $$("menu").hide(); 
                                    if ( ! $$('windowUserConfig'))
                                        showWindowUserConfig(CONFIG);
                                    break;
                                }

                                case "dtsearch":{                                                
                                    webix.send("/dtsearch/", null, "GET", "")
                                    break;
                                }

                                case "map":{                                                
                                    webix.send("/map/", null, "GET", "")
                                    break;
                                }                                                                                                                                                                             
                            }
                        }   
                    }                        
                },

            ]
        }
    }
}