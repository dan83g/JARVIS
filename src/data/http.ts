import axios from 'axios';
import { Method } from 'axios';

// for development usage
var server: string = ""
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    server = "http://localhost:8080";
} else {}

export type SuccessdHandler = (data: any) => void;
export type ErrorHandler = (error: any) => void;

var success_handler = function(data: any): any{
    if (data.data && data?.status=="success")
        return data.data
    else console.log("Сервер вернул ответ неустановленного вида");    
}
var error_handler = function(error: any){
    if (error.response?.status == 417) 
        return error.response.data.message    
    else if (error.response?.status) 
        return `Ошибка сервера: ${error.response.status} (${error.response.statusText})`
    else if (error instanceof Error) 
        return `Ошибка: ${error.message}`
    return "Неизвестная ошибка"
}

export const Requests = {
    exec(method: Method, url: string, params?: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        axios({
            method: method,
            url: `${server}${url}`,
            timeout: 30000,
            params: params
        }).then(response => { if (success_callback !== undefined) success_callback(success_handler(response.data)) }
        ).catch(error => { if (error_callback !== undefined) error_callback(error_handler(error)) });
    },    
    exec_json(method: Method, url: string, data?: any, success_callback?: SuccessdHandler, error_callback?: ErrorHandler): void {
        axios({
            method: method,
            url: `${server}${url}`,
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: data
        }).then(response => {
            if (success_callback !== undefined) success_callback(success_handler(response.data)) 
        }
        ).catch(error => {
            if (error_callback !== undefined) 
                error_callback(error_handler(error))
        });
    }
} as const;

export function baseUrl(): string{    
    let site = document.location;
    return `${site.protocol}//${site.host}`;
}

export function fullUrl(sub_url: string): string{
    if (sub_url.substring(0,1) != '/')
        return `${baseUrl()}/${sub_url}`
    return `${baseUrl()}${sub_url}`
}
