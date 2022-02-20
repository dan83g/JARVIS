import { Requests, SuccessdHandler, ErrorHandler } from "./http";

export const SearchTypes = {    
    list(success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
        Requests.exec('GET', '/type.list', {}, success_callback, error_callback);
    },
} as const;

export const User = {    
    loadSettings(success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
        Requests.exec('GET', '/api/v1/user', {}, success_callback, error_callback);
    },
    saveSettings(data: any, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
        Requests.exec_json('POST', '/api/v1/user', {}, success_callback, error_callback);
    },
} as const;

export const Queries = {
    execute(id: string, success_callback?:SuccessdHandler, error_callback?: ErrorHandler): void {
        Requests.exec('GET', `/search/query/${id}`, {}, success_callback, error_callback);
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