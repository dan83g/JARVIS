import * as $ from 'jquery';
import {json2table} from "./table";
import {Query} from "./service";
import { AutoScroll, WebixCallback } from '../../static/cdn/webix/6.4.0/types/webix';
(window as any).jQuery = jQuery;

// extend iframe with overlay
interface custom_iframe extends webix.ui.iframe, webix.OverlayBox {}

// extend tabbar with 
webix.extend((webix.ui.tabbar as any).$protoWait[0], {
    defaults: {
        on: {
            onBeforeRender: function(data: any) {
                data.options.forEach(function (cell: any) {
                    if (webix.isUndefined(cell.width))
                        cell.width = webix.html.getTextSize(cell.value, "webix_item_tab").width + 16;
                }, this)
            },
        }
    }
});

// clear timer
export function ClearTimer(aTable: any): void{
    if (aTable.config.timerId){
        clearTimeout(aTable.config.timerId);
        delete aTable.config.timerId;
    }
}

//Ошибки в log
export function logger(type: string, caption: string, message: string, log: string='log'): void {
    let log_config = {
        'error': {color: 'red', icon_tag: 'fas fa-thumbs-down'},
        'warning': {color: '#FFAB23', icon_tag: 'fa-hand-pointer'},
        'info': {color: 'green', icon_tag: 'fa-thumbs-up'},
    }
    let log_text: string = `<font color=${log_config[type]?.color ?? 'gray'} class='fas ${log_config[type].icon_tag ?? 'fa-question'}'>${caption}</font>: ${message}`;
    ($$(log) as webix.ui.list).add({message: log_text});
}     

export function del_tab(tabbar_id: string, tabview_id: string, tab_id: string): void{
    // del tab
    ($$(tabbar_id) as webix.ui.tabbar)?.removeOption(tab_id);
    // delView
    ($$(tabview_id) as webix.ui.tabview)?.removeView(tab_id);
}

// удаляем вкладку если это не вторичный поиск
export function try_del_tab(tab_id: string, value: string): void{
    if (value == undefined || value=='')
        del_tab("tabs", "tabview", tab_id);    
}

export function clear_table(table_id: string): void{
    let table : JQuery = $(`#tablesorter${table_id}`);
    if (table.length){        
        $['tablesorter'].clearTableBody(table);
        table.trigger('update');
    }    
}

const set_tabbar_focus = function(): void {
    let elements = document.getElementsByClassName('webix_item_tab');
    if (elements?.length > 0) (elements[0] as HTMLElement).focus();
}

const get_tab_header = (icon_tag: string = 'database', caption: string): string => `<span class='fas fa-${icon_tag}'> </span> ${caption}`;

export function hide_tab_overlay(tabs: webix.ui.tabbar, table: any): void{
    let tab_id = tabs.optionIndex(table.config.tab_id);
    tabs.config.options[tab_id].value = get_tab_header(table.config.icon_tag, table.config.caption);            
    tabs.refresh();   
}

//HTMLData
export function loadHTMLData(aTable: any, aValue: string='', aNoCache="false", tabs_id: string='tabs'): void{
    // set tabs
    var tabs: webix.ui.tabbar = (<webix.ui.tabbar> webix.$$(tabs_id));
    // clear table
    clear_table(aTable.config.id);
    // show overlay
    aTable.showOverlay("<i class='fas fa-spinner fa-spin fa-3x'></i><br><br><font size='2'><b>Загрузка данных...</b></font>");
    // rquest
    let promise = webix.ajax().headers({"X-Requested-With":"XMLHttpRequest", "X-Cache-Bypass": aNoCache}).get(aTable.config.load_url, {"value": aValue}, function (text, xml, xhr) {
        // hide overlay
        aTable.hideOverlay();
        // hide tab overlay
        hide_tab_overlay(tabs, aTable);

        try{
            // парсим входящие данные
            let oJson = JSON.parse(text);
            
            // Количество строк
            aTable.config.count = oJson.data.length;

            if (aTable.config.count == 0){
                try_del_tab(aTable.config.tab_id, aValue);   
                logger("info", aTable.config.caption, "Нет данных");
            }
            else{ 
                // Заполняем данными                
                aTable.setHTML(json2table(oJson.data, 'tablesorter'+aTable.config.id, "tablesorter"));
                // Если еще вернулся ответ об ошибке с одного из серверов, то выводим в лог
                if (oJson.message){
                    logger("warning", aTable.config.caption, oJson.message);
                }
            };
        }
        catch (e) {
            try_del_tab(aTable.config.tab_id, aValue);
            logger("error", aTable.config.caption, "Ошибка при попытке декодировать ответ сервера: " + e);
        }            
        
        if (aTable.config.isShedule && aTable.config.isShedule == true){ 
            ClearTimer(aTable);
            aTable.config.timerId = setTimeout(loadHTMLData, aTable.config.timeOut, aTable, aValue, "true");
        }
        
        aTable.resize();
        set_tabbar_focus();
    });
    
    promise.catch(function(error){
        // hide tab overlay
        hide_tab_overlay(tabs, aTable);
        // hide overlay
        aTable.hideOverlay();
        // handle errors
        if (error.status == 417){
            try {
                let oJson = JSON.parse(error.responseText);
                if (oJson && oJson.message){
                    try_del_tab(aTable.config.tab_id, aValue);
                    logger("error", aTable.config.caption, "Сервер вернул ошибку: " + oJson.message);                    
                }
            } catch (e) {            
                try_del_tab(aTable.config.tab_id, aValue);
                logger("error", aTable.config.caption, "Ошибка при попытке декодировать ответ сервера: " + e);
            }
        } else {
            try_del_tab(aTable.config.tab_id, aValue);
            logger("error", aTable.config.caption, "Ошибка сервера: " + error.status + "(" + error.statusText + ")");
        }

        if (aTable.config.isShedule && aTable.config?.isShedule == true){
            ClearTimer(aTable);
            aTable.config.timerId = setTimeout(loadHTMLData, aTable.config.timeOut, aTable, aValue, "true");
        }
    }); 
}

// URL
export function loadUrl(aFrame: any, aValue: string=''): void{
    aFrame.load(aFrame.config.load_url);
    if (aFrame.config.isShedule && aFrame.config.isShedule == true){ 
        ClearTimer(aFrame);
        aFrame.config.timerId = setTimeout(loadUrl, aFrame.config.timeOut, aFrame, aValue);     
    }
}

//Запускаем все запросы
export function runAllQueries(): void{
    // tables
    let templates = $$("tabview").queryView( {view:"template"}, "all");
    for (let idx in templates){
        if ( templates[idx] && templates[idx].config.load_url){
            // show overlay
            webix.extend(templates[idx], webix.OverlayBox);
            // run request
            loadHTMLData(templates[idx]);
        };                                  
    };        
    // iframes
    let iframes = $$("tabview").queryView( {view:"iframe"}, "all");
    for (let idx in iframes){
        if ( iframes[idx] && iframes[idx].config.load_url){
            // show overlay
            webix.extend(iframes[idx], webix.OverlayBox);
            // run request
            loadUrl(iframes[idx]);
        };                                  
    };
};

export function iframe_view(query_id: string): any {
    return {
        view: "iframe", id: `iframe${query_id}`, tab_id: query_id,
        load_url: Query.get_query_url(query_id),        
        on:{            
            onBeforeLoad: () => {($$(`iframe${query_id}`) as custom_iframe).showOverlay("<i class='fas fa-spinner fa-spin fa-blue fa-4x'></i><br><br><font size='4'><b>Загрузка страницы...</b></font>")},
            onAfterLoad: () => {
                let iframe = ($$(`iframe${query_id}`) as custom_iframe);
                if (iframe.hasOwnProperty('hideOverlay'))
                    iframe.hideOverlay();
            }
        }
    }
}

export function html_table_view(caption: string, query_id: string, icon_tag: string): any {
    return {
        view: "template",       
        id: `datatable${query_id}`,
        css: `htmltable autowidth datatable${query_id}`,
        tab_id: query_id,
        load_url: Query.get_query_url(query_id),
        caption: caption,
        icon_tag: icon_tag,
        scroll: "auto",
        width: "auto",
        on:{
            onViewShow: function(){
                this.resize();
            },
            // onFocus: function(){
            //     this.resize();
            // },
            onAfterRender: function(){                
                ($('#tablesorter'+this.config.id) as any).tablesorter({
                    caption: caption,                    
                    theme: 'blue',
                    widgets: ['zebra', 'filter', 'stickyHeaders', 'output', 'resizable'],
                    widgetOptions: {
                        resizable: true,                        
                        filter_reset: '.reset',
                        stickyHeaders_attachTo: `.datatable${query_id}`,
                        // stickyHeaders_cloneId: '-gummy',
                        stickyHeaders_cloneId: '-sticky',
                        stickyHeaders : '',                                                       
                        stickyHeaders_offset: 0,                            
                        stickyHeaders_filteredToTop: true,
                        stickyHeaders_addResizeEvent : true,
                        stickyHeaders_includeCaption : true,
                        stickyHeaders_xScroll : null,
                        stickyHeaders_yScroll : null,
                        
                        // output
                        output_separator     : ',',         // ',' 'json', 'array' or separator (e.g. ';')
                        output_ignoreColumns : [],         // columns to ignore [0, 1,... ] (zero-based index)
                        output_hiddenColumns : false,       // include hidden columns in the output
                        output_includeFooter : true,        // include footer rows in the output
                        output_includeHeader : true,        // include header rows in the output
                        output_headerRows    : false,       // output all header rows (if multiple rows)
                        output_dataAttrib    : 'data-name', // data-attribute containing alternate cell text
                        output_delivery      : 'd',         // (p)opup, (d)ownload
                        output_saveRows      : 'f',         // (a)ll, (v)isible, (f)iltered, jQuery filter selector (string only) or filter function
                        output_duplicateSpans: true,        // duplicate output data in tbody colspan/rowspan
                        output_replaceQuote  : '\u201c;',   // change quote to left double quote
                        output_includeHTML   : true,        // output includes all cell HTML (except the header cells)
                        output_trimSpaces    : false,       // remove extra white-space characters from beginning & end
                        output_wrapQuotes    : false,       // wrap every cell output in quotes
                        output_popupStyle    : 'width=580,height=310',
                        output_saveFileName  : 'download_file.csv',
                        // callback executed after the content of the table has been processed
                        output_formatContent : function(config, widgetOptions, data) {
                        // data.isHeader (boolean) = true if processing a header cell
                        // data.$cell = jQuery object of the cell currently being processed
                        // data.content = processed cell content (spaces trimmed, quotes added/replaced, etc)
                        // data.columnIndex = column in which the cell is contained
                        // data.parsed = cell content parsed by the associated column parser
                        return data.content;
                        },                        
                        // callbackJSON used when outputting JSON & any header cells has a colspan - unique names required
                        output_callbackJSON  : function($cell, txt, cellIndex) {
                            return `${txt}(${cellIndex})`;
                        },
                        output_callback : function(config, data, url) {
                            let BOM = "\uFEFF"; // The BOM character to force Excel opens CSV as UTF-8
                            return BOM + data;
                        },                        
                        // the need to modify this for Excel no longer exists
                        output_encoding      : 'data:application/octet-stream;charset=utf8,',                        
                        // override internal save file code and use an external plugin such as
                        output_savePlugin    : null,                        
                    }
                });
            }
        },        
    }    
}

const get_view_id = (query_id: string, iframe: boolean): string => (iframe == true ? `iframe${query_id}` : `datatable${query_id}`);

export function tab_view(tab_caption: string, query_id: string, iframe: boolean, icon_tag: string): any{
    var view_id = get_view_id(query_id, iframe);
    if (iframe == true){        
        var sub_control = iframe_view(query_id);
        var tab_header = get_tab_header(icon_tag, tab_caption);
        var hidden = true;        
    } else {
        var sub_control = html_table_view(tab_caption, query_id, icon_tag);
        var tab_header = get_tab_header('spinner fa-spin', tab_caption);
        var hidden = false;        
    }

    return {
        header: tab_header,
        body: {
            // id автоматом попадет в Options tabbar
            id: query_id,
            rows: [
                sub_control,
                {
                    height: 38,
                    cols: [
                        {
                            view:"text",
                            id:"textSearch"+query_id, 
                            value:"", 
                            label:"Поиск", 
                            labelWidth:50, 
                            labelAlign:'right', 
                            width:350,                             
                            placeholder: "Введите текст для поиска",
                            tooltip: "Выполнить запрос с новыми данными<br>Если строка пустая, то поиск осуществляется с оригинальными данными",
                            hidden: hidden,
                            view_id: view_id,
                            keyPressTimeout:300,                            
                            on:{
                                onChange(newVal, oldVal){
                                    if (this.config && this.config.view_id){                                        
                                        var entity = $$(this.config.view_id);
                                        // HTMLTable
                                        if (entity.config.view == "template"){
                                            loadHTMLData(entity, newVal);
                                        }
                                        // iframe
                                        else if (entity.config.view == "iframe"){
                                            loadUrl(entity, newVal);
                                        }                                     
                                    }
                                }
                            }
                        },
                        {},
                        {
                            view: "button", 
                            type: "htmlbutton",
                            tooltip: "Сохранить как CSV", 
                            label: "<span class='fas fa-save'/> Сохранить",
                            css: "webix_transparent",
                            hidden: hidden,
                            width: 120,
                            click: function(){
                                let date_format = webix.Date.dateToStr("%d%m%Y_%H%i", false);
                                let active_tab_id = (<webix.ui.tabview> webix.$$('tabview')).getTabbar().getValue();
                                let tables: JQuery = $(`#tablesorterdatatable${active_tab_id}`);
                                let table: any = tables[0];
                                table.config.widgetOptions.output_separator = ';';
                                table.config.widgetOptions.output_saveFileName = table.config.caption + '_' + date_format(new Date()) + '.csv';                                
                                tables.first().trigger('outputTable');
                            }                                
                        },
                        {},
                        { 
                            view:"select", 
                            label:"Обновление",
                            tooltip: "Данный запрос будет периодически обновляться", 
                            width:230, 
                            labelWidth:100, 
                            labelAlign:'right',
                            view_id: view_id,
                            textId: "textSearch"+query_id,
                            options:[
                                { "id":-1, "value":"Не обновлять" },
                                { "id":30000, "value":"30 сек" },
                                { "id":60000, "value":"1 мин" },
                                { "id":300000, "value":"5 мин" },
                                { "id":600000, "value":"10 мин" },
                            ],

                            on:{
                                onChange: function(newv, oldv){
                                    if (this.config && this.config.view_id){
                                        var entity: any = $$(this.config.view_id);
                                        if (newv != -1){                                            
                                            entity.config.isShedule = true
                                            entity.config.timeOut = newv

                                            var value =  ($$(this.config.textId) as webix.ui.text).getValue();
                                            // HTMLTable
                                            if (entity.config.view == "template"){
                                                ClearTimer(entity);
                                                loadHTMLData(entity, value, "true");
                                            }                                            
                                            // iframe
                                            else if (entity.config.view == "iframe"){
                                                loadUrl(entity, value );                                            
                                            }                                            
                                        }
                                        else{
                                            entity.config.isShedule = false;
                                            entity.config.timeOut = newv;
                                            ClearTimer(entity);                                            
                                        }
                                    };
                                }
                            }
                        }
                    ]
                },
            ]
        }
    }   
}