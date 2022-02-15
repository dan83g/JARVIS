// css
require('../style.css');

import {CONFIG, main_menu, menu_button, set_user_label} from '../general/index';
import { init_custom_daterangepicker, custom_iframe } from './proto';

//инициализируем базовые настройки WEBIX
webix.Date.startOnMonday = true;
webix.i18n.dateFormat = "%d.%m.%Y";
webix.i18n.fullDateFormat = "%d.%m.%Y %H:%i";
webix.i18n.setLocale("ru-RU");
var dateFormatDataTable = webix.Date.dateToStr("%d.%m.%Y %H:%i", false);
var dateFormatDownload = webix.Date.dateToStr("%d%m%Y_%H%i", false);

class DtSearchPage {
    public no_toolbar: boolean = true
    public query: string = undefined
    public index_pathes: string = undefined
    public search_type: number = undefined
    public ext: string = undefined
    public dtsearch_server_url: string = undefined

    constructor(server_data: any){
        this.no_toolbar = server_data.no_toolbar
        this.query = server_data.query
        this.index_pathes = server_data.index_pathes
        this.search_type = server_data.search_type
        this.ext = server_data.ext
        this.dtsearch_server_url = server_data.dtsearch_server_url
    }
    init(): void {
        // custom scroll
        webix.CustomScroll.init();        
        // init dtsearch daterangepicker
        init_custom_daterangepicker();
        // main menu
        const main_menu: webix.ui.layout = this.render_main_menu();
        // controls 
        const main_view: webix.ui.layout = this.render_main_view();
        // extends iframe with overlay                        
        webix.extend($$('iframe'), webix.OverlayBox);
        // set user to label
        set_user_label(<webix.ui.label> webix.$$('labelUser'), CONFIG);
        // run search if search parameters is present
        if((<webix.ui.multicombo>webix.$$("indexpathes")).getValue()!="" && (<webix.ui.textarea>webix.$$("query")).getValue()!="")
            this.run_search((<webix.ui.form>webix.$$("form")));
    }
    toolbar_view(): any {
        return {                
            view: "toolbar",
            id: "toolbar",                  
            height: 35,
            hidden: this.no_toolbar,
            cols: [     
                {cols: [menu_button(CONFIG), {}], },
                {},
                // user label
                { view: "label", id: "labelUser", align: "right"},
            ]
        }
    }
    dtsearch_form_view(): any {
        return {
            view:"form", id:"form", width:550,
            elements:[
                { 
                    margin:5, 
                    cols:[
                        { 
                            view:"textarea", name:"query", id:"query", 
                            validate:"isNotEmpty",
                            placeholder:"<Введите текст для поиска>",
                            on:{
                                onEnter:function(){
                                    this.run_search($$('form') as webix.ui.form);
                                }.bind(this)
                            },
                            value: this.query
                        },
                        { 
                            view:"button", id:"btn_search", type:"htmlbutton", 
                            width:40, height:40, maxHeight:40,
                            label:"<span class='fas fa-search'/>", 
                            tooltip:"Запустить поиск", 
                            click:function(id, event){
                                this.run_search($$('form') as webix.ui.form);
                            }.bind(this)
                        },
                    ]
                },

                //indexes
                {
                    view:"multicombo", id:"indexpathes", 
                    label:"Индекса", name:"indexpathes",               
                    selectAll:true, maxWidth:320,                                            
                    value: this.index_pathes,
                    validate:"isNotEmpty", validateEvent:"key",
                    suggest: {
                        selectAll: true,
                        body:{url:"/dtsearch/index.list"}
                    }
                },
                //searchtype
                { 
                    margin:5, 
                    cols:[                                             
                        { view:"richselect", id:"searchtype", name:"searchtype", label:"Тип поиска", tooltip:"Тип поиска", labelWidth:80, width:325,
                            value: this.search_type,
                            options:[
                                {id:1, value:"Все слова"},
                                {id:2, value:"Любое из слов"}, 
                                {id:3, value:"Регулярное выражение"},
                                {id:4, value:"Конкретная фраза"}
                            ]
                        },
                    ]
                },  
                //fuzzy
                { 
                    margin:10, 
                    cols:[ 
                        { view:"switch", id:"fuzzy", name:"fuzzy", onLabel:"Нечеткий поиск", offLabel:"Нечеткий поиск", tooltip:"Нечеткий поиск", width:160, click:function(id, event){                     
                                if (this.getValue()==0) $$("fuzzycount").disable();
                                else $$("fuzzycount").enable();
                            }
                        },
                        { view:"counter", id:"fuzzycount", name:"fuzzycount", label:"ошибок",disabled:true, step:1, value:1, min:1, max:9, tooltip:"Количество ошибок при нечетком поиске", labelWidth:60, width:160},
                    ]
                },

                //stemming and phonic    
                { 
                    margin:5, 
                    cols:[
                        {view:"switch", id:"stemming", name:"stemming", onLabel:"Стеминг",offLabel:"Стеминг", tooltip:"Морфологический поиск", width:100},
                        {view:"switch", id:"phonic", name:"phonic", onLabel:"Фонетический поиск",offLabel:"Фонетический поиск", tooltip:"Фонетический поиск", width:170},
                        {}                                                   
                    ]
                },

                //фильтр по дате
                { 
                    margin:5, 
                    cols:[  
                        {
                            view: "daterangepicker_datasearch", name: "datefilter", isfilter: true, label: "Дата",
                            labelWidth: 90, width:325, maxWidth:325,
                            tooltip:"Фильтр по дате последней модификации файла\n- Если выбрана одна дата - больше выбранной даты\n- Если две - диапазон между выбранных дат",
                            editable: false,
                            format: "%d.%m.%Y",
                            suggest: {
                                view: "daterangesuggest",
                                body: {
                                    calendarCount: 2,
                                    timepicker: false
                                }
                            }
                        },
                    ]
                },
                //file_ext
                { 
                    margin:5, 
                    cols:[                                         
                        {
                            view: "multicombo", id:"ext", name:"ext", label:"Расширение", labelWidth:90, 
                            tooltip: "фильтр по расширению файлов",                                         
                            selectAll: true,
                            width:325, maxWidth:325,
                            value: this.ext,
                            suggest: {
                                selectAll: true,               
                                body:{
                                    data:[
                                        {"id":"txt","value":"txt"},
                                        {"id":"eml","value":"eml"},
                                        {"id":"doc","value":"doc"},
                                        {"id":"docx","value":"docx"},
                                        {"id":"xls","value":"xls"},
                                        {"id":"xlsx","value":"xlsx"},
                                        {"id":"pdf","value":"pdf"},
                                        {"id":"RO","value":"RO"},
                                        {"id":"RU","value":"RU"},
                                        {"id":"DB","value":"DB"},
                                        {"id":"GG","value":"GG"},
                                    ]
                                }
                            }
                        },                                                                                                                                    
                    ]
                }
            ]
        }
    }
    result_datatable_view(): any {
        return {
            gravity: 20, view: "datatable", id: "datatable_results", css: "dtstyle", resizeColumn: true,
            columns: [
                { id:"active", header:{ content:"masterCheckbox", contentId:"active" }, template:"{common.checkbox()}", width:40},
                { id:"name",        header:"Название",   sort: "string",        width:120, fillspace: true},
                { id:"datetime",    header:"Дата",       sort: "string",        width:114, format:dateFormatDataTable},
                { id:"filesize",    header:"Размер",     sort: "int",           width:60},
                { id:"hitcount",    header:"Кол-во",     sort: "int",           width:64, css:{'text-align':'center'}},
                { id:"fullname",    header:"<span href='#' class='fas fa-download' style='margin-top:9px;margin-left:15px;'/>", template:`<a href='${this.dtsearch_server_url}/api/file/?filename=#fullname#'>Скачать</a>`, width:64}
            ],
            select: "row",
            on:{
                onBeforeLoad:function(){                       
                    this.showOverlay("<i class='fas fa-spinner fa-spin fa-3x'></i><br><br><font size='2'><b>Загрузка данных...</b></font>");                                                                                                            
                },
                onAfterLoad:function(){                
                    if (!this.count()){
                        this.showOverlay("<i class='fas fa-ghost fa-3x'></i><br><br><font size='2'><b>Нет данных</b></font>");    
                    }
                    else{                                                    
                        this.hideOverlay();                            
                    }
                    let status = $$("status") as webix.ui.template;
                    status.define('template', `Всего: ${this.count()} файлов`);
                    status.refresh();                                            
                },
                onLoadError:function(text, xml, xhr){
                    
                    try {
                        let oJson = JSON.parse(text);
                        if (oJson && oJson.message){
                            this.showOverlay(`<i class='fas fa-skull-crossbones fa-2x'></i><br><br><font size='2'><b>Сервер вернул ошибку: <br>${oJson.message}</b></font>`);
                        }
                    } catch (error) {
                        this.showOverlay(`<i class='fas fa-skull-crossbones fa-2x'></i><br><br><font size='2'><b>Ошибка при попытке декодировать ответ сервера: <br>${error}</b></font>`);
                    }
                },
                onItemClick: function(id, e, node){
                    let datatable = $$("datatable_results") as webix.ui.datatable;
                    var item = datatable.getItem(id);
                    //добавляем в config last_id, воизбежание повторного выполнения запроса, если он уже был сделан
                    if ((datatable.config as any).last_id != item.id)
                        ($$("iframe") as webix.ui.iframe).load(`${this.dtsearch_server_url}/api/text/?filename=${item.fullname}&hits=${item.hits}#hit1`);
                    (datatable.config as any).last_id = item.id;
                }.bind(this),
            } 
        }
    }
    status_view(): any {
        return {
            cols:[
                {template: " ", id: "status", borderless: false},    
                {},
                {view:"button", type:"htmlbutton", id:"btnSave", label:"<span class='fas fa-download'/> Скачать все" , width:130, hidden: true,
                    click:function(id, event){        
                        $$("btnSave").disable();
                        let data = (<webix.ui.datatable>webix.$$("datatable_results")).serialize();
                        var files = ''
                        var cnt = 0
                        for (var col in data){
                            if (data[col].active==true){
                                files = files + data[col].fullname+',';
                                cnt = cnt + 1
                            }
                        }

                        if (cnt==0){
                            webix.message("Ни один из файлов не выбран", "error", 4000);
                            $$("btnSave").enable();
                            return;
                        };

                        if (cnt==1){
                            var link = document.createElement('a');
                                link.href = `/files/?file=${files}`;
                                // ????
                                link.download = 'true'
                                link.click();
                                link.parentNode.removeChild(link);
                                $$("btnSave").enable();                                                   
                        }
                        else{
                            if (files!=''){
                                let config: RequestInit = {
                                    method: 'POST',
                                    body: files,
                                    credentials: 'same-origin'
                                }

                                fetch("/files/", config)
                                    .then(response => response.blob())
                                    .then(zipFile => {                                                            
                                        var blob = zipFile;
                                        var link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob);
                                        link.download = "files_archive_" + dateFormatDownload(new Date()) + ".zip"
                                        link.click();
                                        link.parentNode.removeChild(link);
                                        $$("btnSave").enable();
                                    })
                                    .catch((error) => {
                                        console.log("Error: ", error)
                                        $$("btnSave").enable();
                                    })
                            }
                        }
                    }.bind(this)
                }, 
            ]
        }    
    }
    iframe_view(): any {
        return  {
            view:"iframe", id:"iframe", src:"blank/",
            on:{
                onBeforeLoad: () => {($$("iframe") as custom_iframe).showOverlay("<i class='fas fa-spinner fa-spin fa-blue fa-4x'></i><br><br><font size='4'><b>Загрузка страницы...</b></font>")},
                onAfterLoad: () => {
                    let iframe = ($$("iframe") as custom_iframe);
                    if (iframe.hasOwnProperty('hideOverlay'))
                        iframe.hideOverlay();
                }
            }
        }
    }
    render_main_menu(): webix.ui.layout {  
        return <webix.ui.layout> webix.ui(main_menu(CONFIG));
    }
    render_main_view(): webix.ui.layout {
        // toolbar
        var toolbar_main = this.toolbar_view();

        return <webix.ui.layout> webix.ui({                    
            margin: 0,
            css: `${CONFIG.skin} webix_padding_0`,
            rows: [
                // if no toolbar
                toolbar_main,
                {cols:[                             
                    {
                        rows:[
                            this.dtsearch_form_view(),
                            {view: "resizer"},
                            this.result_datatable_view(),                        
                            this.status_view()
                        ]},
                    {view: "resizer"},
                    this.iframe_view(),
                ]}
            ]
        });
    }
    run_search(form: webix.ui.form): void {
        if (!form.validate()){
            webix.message("Правильно заполните форму", "error", 4000);
            return
        }
        var datatable_results: webix.ui.datatable = (<webix.ui.datatable>webix.$$("datatable_results"));
        // clear datatable
        datatable_results.clearAll();
        // show spinner
        datatable_results.showOverlay("<i class='fas fa-spinner fa-spin fa-3x'></i><br><font size='2'><b>Загрузка данных...</b></font>");
        // post to dtsearch server
        webix.ajax().post(`${this.dtsearch_server_url}/api/search/`, JSON.stringify( (<webix.ui.form>webix.$$("form")).getValues()) , function (text) {
                datatable_results.parse(text, "json");
            }
        ).catch(function(err){
            if (err.status == 0){
                datatable_results.showOverlay(`<i class='fas fa-skull-crossbones fa-2x'></i><br><font size='2'><b>Сервер ${this.dtsearch_server_url} не доступен </b></font>`);                                                
            } else if (err.status == 500){
                try {
                    let json = JSON.parse(err.responseText);
                    if (json && json.message){
                        datatable_results.showOverlay("<i class='fas fa-skull-crossbones fa-2x'></i><br><font size='2'><b>Сервер вернул ошибку: <br>" + json.message + "</b></font>");                                      
                    }
                } catch (e) {
                    datatable_results.showOverlay("<i class='fas fa-skull-crossbones fa-2x'></i><br><font size='2'><b>Ошибка при попытке декодировать ответ сервера: <br>" + e + "</b></font>");                
                }
            } else {
                datatable_results.showOverlay("<i class='fas fa-skull-crossbones fa-2x'></i><br><font size='2'><b>Ошибка сервера: статус - " + err.status + "</b></font>");                
            }
            datatable_results.refresh();
        }.bind(this));             
    }
}

// retrieve from html js
declare var server_data: any;
// init SearchPage
const dtsearch_page = new DtSearchPage(server_data);
// init
dtsearch_page.init();
