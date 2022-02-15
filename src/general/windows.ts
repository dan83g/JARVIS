import {full_url} from './http';

export function showWindowUserConfig(CONFIG: any): void{
    //отрисовываем window
    webix.ui({        
        view: "window",
        css: CONFIG.skin,
        id: "windowUserConfig",        
        width: 750,
        height: 600,
        position: "center",
        move: true,
        modal: true,
        zIndex: 10000,
        head:{
            view:"toolbar",
            cols:[
                {
                    view:"label",
                    label: "<i class='label_1 fas fa-cog fa-spin fa-lg' style='margin-top: 6px;margin-left: 6px;'></i><font class='label_1'></font>"
                },
                {}, 
                {
                    view: "button",
                    type: "htmlbutton", 
                    width: 120,
                    label: "<span class='fa fa-check'> Сохранить</span>",
                    click: function() {
                        // сохраняем запросы
                        CONFIG.save_queries(
                            (<webix.ui.datatable>webix.$$("datatableQueries")).serialize()
                        );
                        // сохраняем настройки
                        CONFIG.save_settings( 
                            (<webix.ui.select>webix.$$("selectSkin")).getValue(),
                            Boolean((<webix.ui.checkbox>webix.$$("checkErrors")).getValue())
                        );
                    }
                },                               
                {
                    view: "button",
                    type: "htmlbutton",
                    label: '<span class="fa fa-times"> Закрыть</span>',
                    width: 100,
                    align: "right",
                    css: "bt_1",
                    click:"$$('windowUserConfig').close();"
                }
            ]
        },
        body: {            
            cols:[
                {  
                    view: "sidebar",
                    width: 140,
                    height: 500,
                    data:[                
                        {id: "itemLook", value: " <i class='fas fa-user-cog' style='margin-left:10px;'></i> Внешний вид"},
                        {id: "itemQueries", value: " <i class='fas fa-tasks' style='margin-left:10px;'></i> Запросы"},
                    ],
                    on:{
                        onAfterSelect: function(id: any){
                            switch (id){                                
                                case "itemLook":{                                                
                                    $$('formLook').show()
                                    $$('datatableQueries').hide()
                                    break;
                                } 

                                case "itemQueries":{                                                
                                    $$('datatableQueries').show()
                                    $$('formLook').hide()
                                    break;
                                }                                                                                                                                                                            
                            }
                        }
                    }
                },
                {
                    rows:[
                        // lookform
                        {
                            view:"form",
                            id:"formLook",
                            width:490,  
                            elements:[
                                // skin
                                { 
                                    view:"select", 
                                    id:"selectSkin",
                                    label:"Тема", 
                                    value: CONFIG.skin,
                                    width:315,
                                    labelWidth:160,                     
                                    options:[
                                        {id: "compact", value: "Синяя" },
                                        {id: "dark", value: "Темная" },
                                        {id: "flat", value:"Голубая" },
                                        {id: "contrast", value:"Контрастная" },
                                        {id: "material", value:"Современная" },
                                        {id: "mini", value:"Минималистичная" },
                                    ], labelAlign:"left" 
                                },
                                // errors
                                {
                                    view:"checkbox", 
                                    id:"checkErrors", 
                                    label:"Отображать ошибки", 
                                    width:315,
                                    labelWidth:160,
                                    value: Number(CONFIG.errors_visible),
                                },
                            ]
                        },
                        // datatable
                        {                            
                            view: "datatable",        
                            id: 'datatableQueries',
                            width: 490,
                            hidden: true,
                            scroll: 'y',
                            select: "row",
                            checkboxRefresh:true,
                            type:{
                                checkbox(obj: any, common: any, value: any){                                    
                                    return `<div class="checkbox webix_inp_checkbox_border webix_el_group webix_checkbox_${value==true?1:0}"><button class="webix_custom_checkbox"></button></div>`
                                }
                            },                              
                            columns: [
                                {id:"active", header:{content:"masterCheckbox", contentId:"active"}, template:"{common.checkbox()}", width:40},
                                {id:"typename", sort:"string", header:[ "Тип", { content:"textFilter" } ], width:200},
                                {id:"name",	 sort:"string", header:[ "Запрос", { content:"textFilter" } ], width:250},
                            ],                            
                            url: full_url("user.queries"),
                            onClick:{
                                checkbox:function(e, id){
                                  const row = this.getItem(id.row);
                                  this.updateItem(id.row, {[id.column]:row[id.column]?false:true})
                                }
                            },                            
                            on:{ 
                                onHeaderClick:function(header: any, event: any, target: any){
                                    if(header.column == "active"){
                                        let control = this.getHeaderContent("active");
                                        let value = control.isChecked()

                                        this.eachRow(function(row: any){
                                            this.updateItem(row, {[header.column]:value});
                                        });
                                    }
                                },                                                               
                                onBeforeLoad:function(){                       
                                    this.showOverlay("<i class='fas fa-cog fa-spin fa-4x'></i><br><br><font size='2'><b>Загрузка данных...</b></font>");                            
                                },
                                onAfterLoad:function(){                
                                    if (!this.count()) this.showOverlay("<i class='fas fa-ghost fa-4x'></i><br><br><font size='2'><b>Нет данных</b></font>");                                                  
                                    else this.hideOverlay();                                                        
                                },
                                onLoadError:function(text: any, xml: any, xhr: any){                
                                    try {
                                        let oJson = JSON.parse(text);
                                        if (oJson && oJson.error){
                                            this.showOverlay("<i class='fas fa-skull-crossbones fa-4x'></i><br><br><font size='2'><b>Сервер вернул ошибку: <br>" + oJson.error + "</b></font>");                                      
                                        }
                                    } catch (e) {
                                        this.showOverlay("<i class='fas fa-skull-crossbones fa-4x'></i><br><br><font size='2'><b>Ошибка при попытке декодировать ответ сервера: <br>" + e + "</b></font>");                
                                    }
                                }
                            }           
                        },
                    ]
                }
            ]
        }
    }).show();
};