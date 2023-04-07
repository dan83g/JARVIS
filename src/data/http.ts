import axios from 'axios';
import { Method } from 'axios';

var server: string = ""
export var errorStatusCode: number =  422
// if development
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    server = "http://1.0.0.8:8080";
    errorStatusCode = 422;
} else {}

export type ErrorHandler = (error: any) => void;


const errorHandler = (error: any): string => {
    if (error.response?.status === errorStatusCode) 
        return error.response.data.message    
    else if (error.response?.status) 
        return `Ошибка сервера: ${error.response.status} (${error.response.statusText})`
    else if (error instanceof Error) 
        return `Ошибка: ${error.message}`
    return "Неизвестная ошибка"
}

export const Requests = {
    async requestWithParams(method: Method, url: string, params?: any): Promise<any> {
        try {
            let response = await axios({
                method: method,
                url: `${server}${url}`,
                timeout: 30000,
                params: params
             });
            return response.status === 200 && response.data.data ? response.data.data : [];
        } catch (error) {
            throw errorHandler(error);
        }        
    },
    async requestWithJson(method: Method, url: string, data?: any): Promise<any> {
        try {
            let response = await axios({
                method: method,
                url: `${server}${url}`,
                timeout: 30000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data
             });
             return response.status === 200 && response.data.data ? response.data.data : [];
        } catch (error) {
            throw errorHandler(error);
        }        
    },
} as const;

export function baseUrl(): string{    
    let site = document.location;
    return `${site.protocol}//${site.host}`;
}

export function fullUrl(sub_url: string): string{
    if (sub_url.substring(0,1) !== '/')
        return `${baseUrl()}/${sub_url}`
    return `${baseUrl()}${sub_url}`
}
