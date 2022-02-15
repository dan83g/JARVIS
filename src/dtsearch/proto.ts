var dateFormatDataSearch = webix.Date.dateToStr("%d/%m/%Y", false);
export interface custom_iframe extends webix.ui.iframe, webix.OverlayBox {}
export function init_custom_daterangepicker(): void {
        //создаем свой daterangepicker_datasearch для datasearch
        webix.protoUI({
            name: "daterangepicker_datasearch",
            //переопределяем дабы избежать ошибки, так как меняем формат Value
            $prepareValue:function(value){
                if (!value)
                    return {start:null, end:null};
                else if (typeof value==='object')
                    return value;
                else if (this.config.tempValue)
                    return this.config.tempValue;                        
            },
            getValue:function(){
                //date "01/01/1990~~12/31/1990")
                let value = webix.ui.daterangepicker.prototype.getValue.apply(this, arguments);
                // save into view config
                this.config.tempValue = value;
                if (value!=null && typeof value==='object' && value.start!=null && value.end!=null)
                    return ` date "${dateFormatDataSearch(value.start)}~~${dateFormatDataSearch(value.end)}"`;
                else if (value!=null && typeof value==='object' && value.start!=null && value.end==null)
                    return ` date "${dateFormatDataSearch(value.start)}~~~~01/01/2099"`;
                else return ""
            }
        }, 
        webix.ui.daterangepicker);
}