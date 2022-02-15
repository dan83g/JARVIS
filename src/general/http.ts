var success_handler = function(data: any): any{
    try {
        var Json = data.json();
    } catch (err) {
        webix.message(`Ошибка при попытке декодировать ответ сервера: <br>${err}`, "error", 5000);
        return
    }
    if (Json && Json.status && Json.status=="success")
        return Json.data
    else webix.message("Сервер вернул ответ неустановленного вида", "error", 5000);    
}
var success_xhr_handler = function(data: any): any{
    try {
        var Json = JSON.parse(data);
    } catch (err) {
        webix.message(`Ошибка при попытке декодировать ответ сервера: <br>${err}`, "error", 5000);
        return
    }
    if (Json && Json.status && Json.status=="success")
        return Json    
    else webix.message("Сервер вернул ответ неустановленного вида", "error", 5000);    
}
var error_xhr_handler = function(error: any){
    if (error instanceof Error) {
        console.log(error.message)
        webix.message(`Ошибка: ${error.message}`);
        return
    } else 
    if (error.status == 417){
        try {
            let oJson = JSON.parse(error.responseText);
            if (oJson && oJson.message)
                webix.message(`Сервер вернул ошибку: <br>${oJson.message}`, "error", 5000);
        } catch (err) {
            webix.message(`Ошибка при попытке декодировать ответ сервера: <br>${err}`, "error", 5000);
        }
    } else {        
        webix.message(`Ошибка сервера: ${error.status} (${error.statusText})`);
    }    
}

export type SuccessdHandler = (data: any) => void;
export type ErrorHandler = () => void;
export const Requests = {
    get(url: string, params?: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        webix.ajax().get(url, params).then(function(data){
            var result: any = success_handler(data)
            if(success_callback !== undefined) success_callback(result)
        }).catch(function(error){
            error_xhr_handler(error);
            if(error_callback !== undefined) error_callback();
        });
    },
    get_sync(url: string, params?: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        webix.ajax().sync().get(url, params, function(data){
            var result: any = success_xhr_handler(data)
            if(success_callback !== undefined) success_callback(result)
        });
    },    
    post(url: string, params: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        webix.ajax().post(url, params).then(function(data){
            var result: any = success_handler(data)
            if(success_callback !== undefined) success_callback(result)
        }).catch(function(error){
            error_xhr_handler(error);
            if(error_callback !== undefined) error_callback();
        });
    },
    post_json(url: string, params: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        webix.ajax().headers({"Content-type":"application/json"}).post(url, params).then(function(data){
            var result: any = success_handler(data)
            if(success_callback !== undefined) success_callback(result)
        }).catch(function(error){
            error_xhr_handler(error);
            if(error_callback !== undefined) error_callback();
        });
    },    
    put(url: string, params: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        webix.ajax().headers({"Content-type":"application/json"}).put(url, params).then(function(data){
            var result: any = success_handler(data)
            if(success_callback !== undefined) success_callback(result)
        }).catch(function(error){
            error_xhr_handler(error);
            if(error_callback !== undefined) error_callback();
        });
    },
    delete(url: string, params: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        webix.ajax().headers({"Content-type":"application/json"}).del(url, params).then(function(data){
            var result: any = success_handler(data)
            if(success_callback !== undefined) success_callback(result)
        }).catch(function(error){
            error_xhr_handler(error);
            if(error_callback !== undefined) error_callback();
        });
    }
} as const;

export function base_url(): string{    
    let site = document.location;
    return `${site.protocol}//${site.host}`;
}

export function full_url(sub_url: string): string{
    if (sub_url.substring(0,1) != '/')
        return `${base_url()}/${sub_url}`
    return `${base_url()}${sub_url}`
}
