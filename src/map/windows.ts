import { SuccessdHandler } from "../general/http";
import { UserLayers } from "./service";

export function show_save_layer_window(CONFIG: any, layer_list: [], currenat_layers: any, callback?:SuccessdHandler): void{
    webix.ui({
        css: CONFIG.skin,        
        view:"window",
        id:"windowSaveLayer",        
        width:650,
        position:"center",
        zIndex: 5000,
        move:true,
        head:{
            view:"toolbar", cols:[
                { view:"label",width:150, label: "<i class='fas fa-database'></i> Сохранить слой"},
                {},
                {view:"button", type: "htmlbutton", label: '<span class="fa fa-times"></span>', width: 33, align: 'right', click:"$$('windowSaveLayer').close();"}
            ]
        },
        modal:true,
        body: {            
            borderless: true,
            view: "form",
            id: "form_layer_save",
            elements: [
                {view: "text", id: "layer_text", name: "layer_text", label: "Название", width: 300, validate: "isNotEmpty", suggest: layer_list},
                {
                    view: "button", label: "Сохранить", type: "form",
                    click: function () {
                        if (!(<webix.ui.form>webix.$$("form_layer_save")).validate()){
                            webix.message("Корректно заполните форму", "error", 4000);
                            return
                        }
                        let layer_name = (<webix.ui.text>webix.$$("layer_text")).getValue();
                        UserLayers.save_layer(layer_name, layer_list, currenat_layers.toGeoJSON(), callback);
                        (<webix.ui.window>webix.$$('windowSaveLayer')).close();
                    }                                                                                
                }                   
            ]
        }
    }).show();
    (<webix.ui.text>webix.$$("layer_text")).focus();
}; 

export function show_coordinates_window(CONFIG: any, MAP_CONFIG: any, success_callback: SuccessdHandler): void{
    //отрисовываем window
    webix.ui({        
        view:"window",
        id:"windowShowPoints",        
        width:650,
        css: CONFIG.skin,
        height:410,
        position:"center",
        zIndex:5000,
        move:true,
        head:{
            view:"toolbar", cols:[
                { view:"label", label: "<i class='fas fa-map-marker-alt fa-lg'></i><font class='label_1'>  Точки на карту </font>"},
                {},                
                { view:"button", type: "htmlbutton", label: '<span class="fa fa-times"> Закрыть</span>', width: 100, align: 'right', css:"bt_1", click:"$$('windowShowPoints').close();"}
            ]
        },
        modal:true,
        body: {
            rows:[
                {   
                    view: "textarea",
                    id: "pointsText",                                        
                    placeholder: "<Введите текст с координатами>",                    
                    height: 300,
                    width: 650                     
                },
                {
                    view: "button", label: "Отобразить на карте", width:200, align: "center",  click: function () {
                        if(success_callback !== undefined) 
                            success_callback((<webix.ui.text>webix.$$("pointsText")).getValue());
                        (<webix.ui.window>webix.$$('windowShowPoints')).close();
                    }
                }                 
            ]            
        }
    }).show();

    (<webix.ui.text>webix.$$("pointsText")).focus();
};