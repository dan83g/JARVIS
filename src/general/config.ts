import {Requests, full_url} from './http';

export class Config{

    public username: string = "unknown";
    public lastname?: string;
    public firstname?: string; 
    public groups?: string;
    public last_login?: Date;
    public skin: string = "dark";
    public errors_visible: boolean = true;

    public constructor() {
        //   
    }

    // implementation for this
    public load_setting_sync(): void {
        // let webix_calback = function(data: any){
        //     try {
        //         // парсим входящие данные
        //         let oJson = JSON.parse(data);
        //         this.skin = oJson.data.skin;
        //         this.errors_visible = oJson.data.errors_visible;
        //         this.username = oJson.data.username;
        //         this.lastname = oJson.data.lastname;
        //         this.firstname = oJson.data.firstname;
        //         this.groups = oJson.data.groups;
        //         this.last_login = oJson.data.last_login;
        //     } catch (error) {
        //         webix.message(`Ошибка загрузки настроек пользователя: ${error}`, "error", 5000);
        //     }
        // }
        // webix.ajax().sync().get(
        //     full_url("user.settings"),
        //     webix_calback.bind(this)
        // );
        let set_attrs = function(data: any){
            this.skin = data.data.skin;
            this.errors_visible = data.data.errors_visible;
            this.username = data.data.username;
            this.lastname = data.data.lastname;
            this.firstname = data.data.firstname;
            this.groups = data.data.groups;
            this.last_login = data.data.last_login;            
        }
        Requests.get_sync(full_url("user.settings"), {}, set_attrs.bind(this));
    }

    // load_settings
    load_setting(): void{
        let promise = webix.ajax().get(full_url("user.settings"), function(data: any){
            try {
                // парсим входящие данные
                let oJson = data.json()
                this.skin = oJson.data.skin;
                this.errors_visible = oJson.data.errors_visible;
            } catch (error) {
                webix.message(`Ошибка загрузки настроек пользователя: ${error}`, "error", 5000);
            }               
        })

        // catch
        promise.catch(function(err: any){   
            try {
                let oJson = JSON.parse(err.responseText);
                if (oJson && oJson.message){
                    webix.message(`Ошибка загрузки настроек пользователя: ${oJson.message}`, "error", 5000);                              
                }
            } catch (error) {
                webix.message(`Ошибка загрузки настроек пользователя: ${error}`, "error", 5000);
            }      
        });                
    }
    // savesettings
    save_settings(skin: string, errors_visible: boolean): void{
        Requests.post_json(full_url("user.settings"), {'skin': skin, 'errors_visible': errors_visible}, function(data: any){            
            let url = window.location.href + (!/nocache/.test(window.location.search) ? (window.location.search ? "&nocache=1" : "?nocache=1") : '');
            // reload current page
            window.location.href = url;
        });
    }
    // save queries
    save_queries(queries: any): void{
        Requests.post_json(full_url("user.queries"), {'queries': queries});
    }    
    // load script
    dyn_load_css(filename:string){        
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if (typeof fileref!="undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}
