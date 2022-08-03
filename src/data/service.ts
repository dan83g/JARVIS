import { Requests, SuccessdHandler, ErrorHandler, fullUrl } from "./http";

export interface QueryParams {
    value: string;
    typename?: string;
    date_from?: Date;    
    date_to?: Date;
}

export const SearchTypes = {    
    getList(): any {
        return Requests.getWithParams('GET', '/search/type.list');
    },
    detect(value?: string): any {
        return Requests.getWithParams('GET', '/search/type.detect', {value: value});
    }
} as const;

export const User = {    
    loadSettings(): Promise<any> {
        return Requests.getWithParams('GET', '/api/v1/user');
    },
    saveSettings(data: any): Promise<any> {
        return Requests.getWithJson('POST', '/api/v1/user');
    },
} as const;

export const Queries = {
    getData(id: string): Promise<any> {
        return Requests.getWithParams('GET', `/search/query/${id}`);
    }
} as const;

export const Search = {
    getQueries(params?: QueryParams, url: string = '/search/'): Promise<any> {
        if (params)
            url = `${url}${params.typename ? params.typename + '/': ''}`
        return Requests.getWithParams('POST', url, params);
    },
} as const;


// export const UserLayers = {
//     load_all_layers(success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         Requests.get('/map/user.data', {}, success_callback.bind(this));        
//     },
//     load_layer(layer_id, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         Requests.post('/map/user.data', {id:  layer_id}, success_callback.bind(this), error_callback.bind(this));
//     },
//     save_layer(layer_name: string, layer_list: any, layer_data: any, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         let confirm_callback = () => {Requests.put('/map/user.data', {layername: layer_name, data: layer_data}, success_callback)};
//         let searched_index = layer_list.map(item => item.value).indexOf(layer_name);
//         if (searched_index >= 0)            
//             webix.confirm({title: "Подтверждение", ok: "Да", cancel: "Нет", text:"Слой с таким названием уже существует, перезаписать?"}).then(confirm_callback).catch(error_callback);
//         else 
//             confirm_callback();
//     },
//     delete_layer(layer_id: number, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         let confirm_callback = () => {Requests.delete('/map/user.data', {id: layer_id}, success_callback, error_callback)};
//         webix.confirm({title: "Подтверждение", ok: "Да", cancel: "Нет", type:"confirm-warning", text:"Будет удален слой, продолжить?"}).then(confirm_callback).catch(error_callback);
//     }    
// } as const;

// export const Geo = {
//     search_geoname(geo_object_name: string, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         Requests.post_json('/map/geoname.search', {geoname: geo_object_name}, success_callback, error_callback);        
//     },
//     search_coordinates_by_text(text_with_coordinates: string, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         Requests.post_json('/map/coordinates.search', {coordinates: text_with_coordinates}, success_callback, error_callback);
//     },
//     search_coordinates_by_hash(coordinates_hash: string, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
//         Requests.post_json('/map/coordinates.search', {coordinates_hash: coordinates_hash}, success_callback, error_callback);
//     },
// } as const;