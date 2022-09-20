import axios, { AxiosPromise } from 'axios';
import { Method } from 'axios';

var server: string = ""
export var errorStatusCode: number =  417
// if development
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    server = "http://localhost:8080";
    errorStatusCode = 206
} else {}

export type SuccessdHandler = (data: any) => void;
export type ErrorHandler = (error: any) => void;

const successHandler = (data: any): any => {
    if (data.data && data?.status=="success")
        return data.data
    else console.log("Сервер вернул ответ неустановленного вида");    
}
const errorHandler = (error: any): string => {
    if (error.response?.status == errorStatusCode) 
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
             return successHandler(response.data);
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
             return successHandler(response.data);
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
    if (sub_url.substring(0,1) != '/')
        return `${baseUrl()}/${sub_url}`
    return `${baseUrl()}${sub_url}`
}
