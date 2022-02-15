import 'leaflet/dist/leaflet.css';
import { CONFIG, main_menu, menu_button, set_user_label } from '../general/index';
import { show_save_layer_window, show_coordinates_window } from './windows';
import { init_draw, set_popup_content } from './draw';
import { Geo, UserLayers } from './service';
import * as L from 'leaflet';

// export
require('./plugins/leaflet.export.js');
// search
require('./plugins/leaflet-search.js');
require('./plugins/leaflet-search.css');
// draw
require('./plugins/leaflet.draw.js');
require('./plugins/leaflet.draw.css');
// graticule
require('./plugins/leaflet.graticule.js');
// basemaps
require('./plugins/leaflet-basemaps.js');
require('./plugins/leaflet-basemaps.css');
// coordinates
require('./plugins/leaflet.coordinates.min.js')
require('./plugins/leaflet.coordinates.css')
// style
import '../style.css';

// init base settings of WEBIX
webix.Date.startOnMonday = true;
webix.i18n.dateFormat = "%d.%m.%Y";
webix.i18n.fullDateFormat = "%d.%m.%Y %H:%i";
webix.i18n.setLocale("ru-RU");  
var dateFormat = webix.Date.dateToStr("%d.%m.%Y %H:%i", false);
var dateFormatDownload = webix.Date.dateToStr("%d%m%Y_%H%i", false);

class MapPage {
    //  public MAP_CONFIG: any
    public MAP_CONFIG: any = {
        map: undefined,
        crs: L.CRS.EPSG3857,        
        tiles: [],
        tilelayer: undefined,
        editable_layers: undefined,
        user_layers: [],
        info: undefined,
        current_mark: undefined,
        geoname: undefined,
        coordinates: undefined,
        basemaps: [],
    };
    constructor(server_data: any){
        this.MAP_CONFIG.geoname = server_data.geoname;
        this.MAP_CONFIG.coordinates_hash = server_data.coordinates_hash;
        this.MAP_CONFIG.tiles = server_data.tiles;
    }
    init(): void {
        // declare as globall
        (window as any).closeInfoPanel = this.close_info_panel.bind(this);
        (window as any).moveToPoint = this.move_to_point.bind(this);
        // main menu
        const main_menu: webix.ui.layout = this.main_menu_view();
        // controls 
        const main_view: webix.ui.layout = this.main_view();
        // set user to label
        set_user_label(<webix.ui.label> webix.$$('labelUser'), CONFIG);
        // load_user_layers
        this.load_user_layers_list();
        // prepare tiles
        this.init_tiles();
        // init Map
        this.init_map();
        // init_basemaps
        this.init_basemaps();
        // init graticule
        this.init_graticule();
        // draw.js
        init_draw(this.MAP_CONFIG);
        // coordinates
        this.init_coordinates();
        // search.js
        this.init_search();
        if (this.MAP_CONFIG.geoname)
            this.search_geo_object(this.MAP_CONFIG.geoname);
        if (this.MAP_CONFIG.coordinates_hash)
            this.search_coordinates(this.MAP_CONFIG.coordinates_hash, true);
    }
    button_start_spinning(view_index:string): void{
        let button: webix.ui.button = <webix.ui.button>webix.$$(view_index);
        button.define("label", "<i class='fas fa-spinner fa-spin'/>");
        button.refresh();
    }
    button_stop_spinning(view_index:string, icon_class_name: string): void{
        let button: webix.ui.button = <webix.ui.button>webix.$$(view_index);
        button.define("label", `<i class='fas ${icon_class_name}'/>`);
        button.refresh(); 
    }
    load_user_layers_list(): void{
        let success_callback = (data: any) => {
            let result_data = data ?? [];
            let select: webix.ui.select = (<webix.ui.select>webix.$$("select_layers"));
            select.define("options", result_data);
            select.refresh();
            this.MAP_CONFIG.user_layers = result_data;
        }
        UserLayers.load_all_layers(success_callback.bind(this));
    }
    point_as_circle_marker(aFeature: any, latlng: any): any{
        return L.circleMarker(latlng, {radius: 8, color: "#00F", weight: 2,});
    }

    feature_style(feature: any){
        const styles = {
            'Polygon': {color: "#cb59e2", weight: 2},
            'Point': {color: "#0000ff", weight: 2},
            'LineString': {color: "#f357a1", weight: 2}
        }
        return styles[feature.geometry.type] ?? {color: "#cb59e2", weight: 2}
    }
    on_each_feature_closure(): any{
        return function onEachFeature(feature: any, layer: any) {
            if (feature.properties && feature.properties.title) {            
                layer.options.title=feature.properties.title;        
                layer.bindPopup(feature.properties.title);
                set_popup_content(layer);
                this.MAP_CONFIG.editable_layers.addLayer(layer);        
            } else {
                layer.options.title="";        
                layer.bindPopup("");
                set_popup_content(layer);
                this.MAP_CONFIG.editable_layers.addLayer(layer);
            }
        }.bind(this)
    }    
    geojson_to_map(geo_json: any): void {
        if (geo_json && geo_json.features){                                                                                                
            let layer = L.geoJSON(geo_json.features, {
                    onEachFeature: this.on_each_feature_closure(),
                    style: this.feature_style,               
                    pointToLayer: this.point_as_circle_marker,
                }
            ).addTo(this.MAP_CONFIG.map);
            if (geo_json.features.length>1)
                this.MAP_CONFIG.map.fitBounds(layer.getBounds());                                           
        }
    }
    download_map_as_image(caption: string, format: string, filename: string): void{
        let download_options = {
            container: this.MAP_CONFIG.map._container,
            caption: {
                text: caption,
                font: '14px Arial',
                fillStyle: 'black',
                position: [10, 20]
            },
            // exclude: ['.leaflet-control-zoom', '.leaflet-control-attribution'],
            // formats: image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon, image/svg+xml, image/webp
            format: format,
            fileName: filename,
            afterRender: function(result: any){return result;},
            afterExport: function(result: any){return result;}
        };
        var promise = this.MAP_CONFIG.map.downloadExport(download_options);
        promise.then(function (result: any) {
            return result;
        });
    }    
    move_to_point(aLat: any, aLon: any, aName:string): void{
        if(this.MAP_CONFIG.current_mark!=undefined)
            this.MAP_CONFIG.map.removeLayer(this.MAP_CONFIG.current_mark);
        this.MAP_CONFIG.map.flyTo([aLat, aLon], 8);
        this.MAP_CONFIG.current_mark = L.circleMarker([aLat, aLon], {radius: 8, color: "#00F", weight: 2,}).addTo(this.MAP_CONFIG.map);
        this.MAP_CONFIG.current_mark.bindPopup("<b>"+aName+"</b>").openPopup();
     }    
    init_info_panel(): void {
        // search result panel
        this.MAP_CONFIG.info = L.control({position: 'bottomright'});               
        // redefine methods (вызов после обновления данных //config.info.update(text)
        this.MAP_CONFIG.info.update = function(text: string) {
            let result_panel = document.querySelector<HTMLElement>(".result_panel");
            if (!text)
                result_panel.style.visibility = "hidden";
            else{
                // this._div.innerHTML = text
                result_panel.innerHTML = text;
                result_panel.style.visibility = "visible";
            }
        };
        this.MAP_CONFIG.info.onAdd = function(map: any) {
            this._div = L.DomUtil.create('div', 'result_panel');                 
            return this._div;
        };
        this.MAP_CONFIG.info.addTo(this.MAP_CONFIG.map);
    }
    show_info_panel(geo_data: any): void {
        if (!this.MAP_CONFIG.info)
            this.init_info_panel();
        let text = "<table height='100%' width='90%'><tr><td></td><td></td><td><a href='javascript:closeInfoPanel()'>Закрыть</a></td></tr>";
        for (var i in geo_data)
            text = `${text} <tr><td>${geo_data[i].obj}</td><td><a href='javascript:moveToPoint(${geo_data[i].lat}, ${geo_data[i].long}, "${geo_data[i].obj}<br>${geo_data[i].geoname}")'>${geo_data[i].geoname}</a></td><td>${geo_data[i].country}</td></tr>`;
        text = `${text} <tr><td></td><td></td><td><a href='javascript:closeInfoPanel()'>Закрыть</a></td></tr></table>`;            
        this.MAP_CONFIG.info.update(text);
    }
    close_info_panel(): void {
        // remove marker
        if (this.MAP_CONFIG.current_mark)
            this.MAP_CONFIG.map.removeLayer(this.MAP_CONFIG.current_mark);
        // remove panel
        if (this.MAP_CONFIG.info){
            this.MAP_CONFIG.map.removeControl(this.MAP_CONFIG.info);
            this.MAP_CONFIG.info = null
        }
    }
    search_geo_object(geo_object_name:string): void {
        if (!geo_object_name){
            webix.message("Необходимо ввести название геообъекта", "info", 4000);
            return;
        }
        this.button_start_spinning('btnSearch');
        let success_callback = (data: any) => {
            this.show_info_panel(data);
            this.button_stop_spinning('btnSearch', 'fa-search');
        };
        let error_callback = () => {
            this.button_stop_spinning('btnSearch', 'fa-search')
        };
        Geo.search_geoname(geo_object_name, success_callback.bind(this), error_callback.bind(this));        
    }
    search_coordinates(value: string, is_hash: boolean): void {
        if (!is_hash && !value){
            webix.message("Необходимо ввести текст с координатами", "info", 4000);
            return;
        }
        this.button_start_spinning('btnSearchCoordinates');
        let success_callback = (data: any) => {
            this.button_stop_spinning('btnSearchCoordinates', 'fa-map-marker-alt');

            if (Array.isArray(data) && data.length>0){
                let geoJsonLayer=L.geoJSON(data, 
                    {   onEachFeature: this.on_each_feature_closure(),
                        style: this.feature_style,               
                        pointToLayer: this.point_as_circle_marker,
                    }).addTo(this.MAP_CONFIG.map);
                let bounds = geoJsonLayer.getBounds();
                if (data.length>1)
                    this.MAP_CONFIG.map.fitBounds(bounds);        
                else
                    this.MAP_CONFIG.map.setView([data[0]['geometry']['coordinates'][1], data[0]['geometry']['coordinates'][0]], 12);
            }
            else webix.message("Координат в тексте не обнаружено", "info", 5000);
        };
        let error_callback = () => {
            this.button_stop_spinning('btnSearchCoordinates', 'fa-map-marker-alt')
        };
        if (is_hash == true) Geo.search_coordinates_by_hash(value, success_callback.bind(this), error_callback.bind(this));
        else Geo.search_coordinates_by_text(value, success_callback.bind(this), error_callback.bind(this));
    }
    toolbar_view(): any {
        return  {
            view: "toolbar",
            id: "toolbar",                  
            height: 35,
            css: 'width_100_percent z_max',
            cols: [     
                {cols: [menu_button(CONFIG), {}],},
                {width:30},
                // markers to map
                { view:"button", id: "btnSearchCoordinates", type: "htmlbutton", label: "<i class='fas fa-map-marker-alt'/>", width:30, tooltip:"Показать маркеры на карте", click:function(id, event){
                        let callback = (data: any) => {this.search_coordinates(data, false)}
                        show_coordinates_window(CONFIG, this.MAP_CONFIG, callback);                                                                                                                                                    
                    }.bind(this)                                
                },
                // save map as image
                { view:"button", type: "htmlbutton", label: "<i class='fas fa-image'/>", width:30, tooltip:"Сохранить как изображение", click:function(id,event){                     
                        // скрываем панель с результатами, иначе easyprint упадет
                        this.close_info_panel();
                        this.download_map_as_image(dateFormat(new Date()), "image/png", `Карта_${dateFormatDownload(new Date())}.png`);
                    }.bind(this)
                },
                {width:30},                                                   
                // search geonames
                { view:"text", id:"textSearch", width:220, tooltip: "Поиск по геоименам объектов (Например: Эльбрус, Псков)", placeholder:"<Введите название>",
                    value: "",
                    on:{
                        onEnter:function(){
                            this.search_geo_object((<webix.ui.text>webix.$$("textSearch")).getValue());
                        }.bind(this),
                    }, 
                },
                // run geoname search
                { view:"button", id:"btnSearch", type: "htmlbutton", label: "<i class='fas fa-search'/>", width:30, tooltip:"Поиск",
                    click:function(id: any, event: any){
                        this.search_geo_object((<webix.ui.text>webix.$$("textSearch")).getValue());
                    }.bind(this),
                },                            
                {width: 30},
                // user layers
                {view:"select", id:"select_layers", width:180, tooltip: "Слои маркеров сохраненные в БД", options: []},
                // load layer
                { view:"button", id:"btnLoad", type: "htmlbutton", label: "<i class='fas fa-upload'/>", width:30, tooltip:"Загрузить слой маркеров из БД", 
                    click:function(id:any, event:any){
                        let layer_id: number = Number((<webix.ui.select>webix.$$("select_layers")).getValue());
                        if (!layer_id){
                            webix.message("Выберите слой для загрузки", "info", 4000);
                            return;
                        }
                        // start button spinner
                        this.button_start_spinning('btnLoad');
                        let success_callback = (data: any) => {
                            this.geojson_to_map(data);
                            this.button_stop_spinning('btnLoad', 'fa-upload');
                        };
                        let error_callback = () => {this.button_stop_spinning('btnLoad', 'fa-upload')};
                        UserLayers.load_layer(layer_id, success_callback.bind(this), error_callback.bind(this));
                    }.bind(this)
                },
                // save layer
                {view:"button", id:"btnSave", type: "htmlbutton", label: "<i class='fas fa-download'/>", width:30, tooltip:"Сохранить слой маркеров в БД", click: function(id, event){
                        let success_callback = (data: any) => {this.load_user_layers_list()};
                        show_save_layer_window(CONFIG, this.MAP_CONFIG.user_layers, this.MAP_CONFIG.editable_layers, success_callback.bind(this));
                    }.bind(this)
                },  
                // delete layer
                {view:"button", id:"btnDelete", type: "htmlbutton", label: "<i class='fas fa-times'/>", width:30, tooltip:"Удалить слой маркеров из БД",                             
                    click:function(id, event){
                        let layer_id: number = Number((<webix.ui.select>webix.$$("select_layers")).getValue());
                        if (!layer_id){
                            webix.message("Выберите слой для удаления", "info", 4000);
                            return;
                        }
                        // start button spinner
                        this.button_start_spinning('btnDelete');

                        let success_callback = (data: any) => {
                            // delete layer
                            let removeIndex = this.MAP_CONFIG.user_layers.map(item => item.id).indexOf(data.id);
                            ~removeIndex && this.MAP_CONFIG.user_layers.splice(removeIndex, 1);
                            // set select
                            let select: webix.ui.select = (<webix.ui.select>webix.$$("select_layers"));
                            select.define("options", this.MAP_CONFIG.user_layers);
                            select.refresh();
                            // stop button spinner
                            this.button_stop_spinning('btnDelete', 'fa-times');
                        };
                        let error_callback = () => {this.button_stop_spinning('btnDelete', 'fa-times')};
                        UserLayers.delete_layer(layer_id, success_callback.bind(this), error_callback.bind(this));
                    }.bind(this)
                },
                {width:10},
                // display username
                { view:"label", id:"labelUser", align:"right"},
            ],
        }
    }
    // map tempalte
    map_template_view():  any {
        return {view: "template", type: "clean", scroll: false, css: 'width_100_percent', template: "<div id='map' style='height: 100%; width: 100%'></div>"}
    }
    // main menu
    main_menu_view(): webix.ui.layout {  
        return <webix.ui.layout> webix.ui(main_menu(CONFIG));
    }
    // main view
    main_view(): webix.ui.layout {
        var toolbar_main = this.toolbar_view();
        var map_template = this.map_template_view();
        return <webix.ui.layout> webix.ui({
            scroll: false,
            css: `${CONFIG.skin} width_100_percent`,
            rows: [toolbar_main, map_template]
        });
    }
    init_tiles(): void {
        let tiles = this.MAP_CONFIG.tiles;
        if (tiles && tiles[0].crs){
            let crs = tiles[0].crs;
            this.MAP_CONFIG.crs = (crs == "EPSG3857") ? L.CRS.EPSG3857 : (crs == "EPSG3395") ? L.CRS.EPSG3395 : (crs == "EPSG4326") ? L.CRS.EPSG4326 : L.CRS.EPSG3857;
        }
        for (var i in tiles) {
            this.MAP_CONFIG.basemaps.push(
                L.tileLayer( 
                    tiles[i].url,
                    {
                        maxZoom: tiles[i].max_zoom,
                        minZoom: tiles[i].min_zoom,
                        label: tiles[i].name,
                        attribution: tiles[i].name,
                        crs: (tiles[i].crs == "EPSG3857") ? L.CRS.EPSG3857 : (tiles[i].crs == "EPSG3395") ? L.CRS.EPSG3395 : (tiles[i].crs == "EPSG4326") ? L.CRS.EPSG4326 : L.CRS.EPSG3857
                    }
                )
            )                   
        }        
    }
    init_map(): void {
        this.MAP_CONFIG.map = new L.Map(
            'map',
            {
                preferCanvas: true,
                downloadable: true,
                editable: true,
                center: new L.LatLng(57.8017, 28.2162), 
                zoom: 12,
                crs: this.MAP_CONFIG.crs,
            }
        );
        // click on map
        var popup = L.popup();
        let onMapClick = function(e: any) {
            popup
            .setLatLng(e.latlng)
            .setContent(e.latlng.toString())
            .openOn(this.MAP_CONFIG.map);
        }
        this.MAP_CONFIG.map.on('click', onMapClick.bind(this));
        // editable layer           
        this.MAP_CONFIG.editable_layers = new L.FeatureGroup();
        this.MAP_CONFIG.map.addLayer(this.MAP_CONFIG.editable_layers);  
    }    
    init_basemaps(): void {
        // init basemaps plugin
        this.MAP_CONFIG.map.addControl(L.control.basemaps({
            basemaps: this.MAP_CONFIG.basemaps,
            tileX: 0,  // tile X coordinate
            tileY: 0,  // tile Y coordinate
            tileZ: 1   // tile zoom level
        }));
        // change map layer
        let onMapLayerChange = function(e: any) {
            let center = this.MAP_CONFIG.map.getCenter();
            this.MAP_CONFIG.tilelayer = e.layer;
            this.MAP_CONFIG.map.options.crs = e.options.crs;
            this.MAP_CONFIG.map.options.min_zoom = e.options.min_zoom;
            this.MAP_CONFIG.map.options.max_zoom = e.options.max_zoom;            
            this.MAP_CONFIG.map.setView(center);
            this.MAP_CONFIG.map._resetView(
                this.MAP_CONFIG.map.getCenter(),
                this.MAP_CONFIG.map.getZoom(),
                true
            )
        }
        this.MAP_CONFIG.map.on('baselayerchange', onMapLayerChange.bind(this));
    }
    init_graticule(): void {
        //определяем координатную сетку
        L.latlngGraticule({
            showLabel: true,
            color: '#222',
            zoomInterval: [
                {start: 2, end: 3, interval: 30},
                {start: 4, end: 4, interval: 10},
                {start: 5, end: 7, interval: 5},
                {start: 8, end: 18, interval: 1}
            ]
        }).addTo(this.MAP_CONFIG.map);
    }
    init_coordinates(): void {
        L.control.coordinates({
            // position:"bootomright",
            decimals:4,
            decimalSeperator:".",
            labelTemplateLat:"Lat: {y}",
            labelTemplateLng:"Long: {x}",
            enableUserInput:false,
            useDMS:false,
            useLatLngOrder: true,
            //markerType: L.circlemarker,
            markerProps: {},
        }).addTo(this.MAP_CONFIG.map);
        L.control.coordinates({
            decimalSeperator:".",
            labelTemplateLat:"Lat: {y}",
            labelTemplateLng:"Long: {x}",
            enableUserInput:false,
            useDMS:true,
            useLatLngOrder: true,
            markerProps: {},
        }).addTo(this.MAP_CONFIG.map);        
    }
    init_search(){
        var searchControl = new L.Control.Search({
            layer: this.MAP_CONFIG.editable_layers,
            position:'topright',
            marker: false,
            initial: false
        });
        
        searchControl.on('search:locationfound', function(e: any) {        
            if  (e.layer)
                e.layer.openPopup();
        }).on('search:collapsed', function(e: any){});
        this.MAP_CONFIG.map.addControl(searchControl)
    }
}

// retrieve from html js
declare var server_data: any;
// init SearchPage
const map_page = new MapPage(server_data);
// init
map_page.init();
