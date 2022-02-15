import * as L from 'leaflet';

export function set_popup_content(aFeature: any): void{
    var popup = aFeature.getPopup();
    var feature = aFeature.feature = aFeature.feature || {};
    feature.type = "Feature";
    feature.properties = feature.properties || {};

    var content = document.createElement("textarea")
    content.style.minWidth = '250px';

    content.addEventListener("keyup", function () {
        feature.properties.title = content.value;
        aFeature.options.title = content.value;
    });
    
    aFeature.on("popupopen", function () {
        if (feature.properties.title)
            content.value=feature.properties.title;
        popup.setContent(content);
        content.focus();
    }); 
}

export function init_draw(MAP_CONFIG: any): void{
    var draw_options = {
        position: 'topright',
        draw: {
            polyline: {
                metric: true,
                shapeOptions: {
                    color: '#f357a1',
                    weight: 2
                },
            },
            polygon: {
                metric: ['km', 'm'],               
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                    color: '#cb59e2',
                    weight: 2,
                }
            },
            //выключаем круговые полигоны
            circle: false, 
            circlemarker: {
                radius: 8,
                color: '#0000FF',                
                weight: 2,                            
            },
            rectangle: {
                // единицы измерения
                metric: ['km', 'm'],

                shapeOptions: {
                    clickable: false,
                    weight: 2
                }
            },
            marker: false,
        },
        edit: {
            featureGroup: MAP_CONFIG.editable_layers, //REQUIRED!!
            remove: true
        }
    };

    // полигоны   
    L.drawLocal.draw.toolbar.buttons.polyline = 'Линейный полигон';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Произвольный полигон';
    L.drawLocal.draw.toolbar.buttons.rectangle = 'Прямоугольный полигон';
    L.drawLocal.draw.toolbar.buttons.circle = 'Круглый полигон';
    L.drawLocal.draw.toolbar.buttons.circlemarker = 'Маркер';
    L.drawLocal.draw.toolbar.buttons.marker = 'Маркер';
    L.drawLocal.draw.toolbar.actions.text = "Отмена";
    L.drawLocal.draw.toolbar.finish.text = "Завершить";
    L.drawLocal.draw.toolbar.undo.text = "Удалить последнюю точку";

    //редакторы
    L.drawLocal.edit.toolbar.buttons.remove = 'Удалить все';
    L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Нет элементов для удаления';
    L.drawLocal.edit.toolbar.buttons.edit = 'Редактировать';
    L.drawLocal.edit.toolbar.buttons.editDisabled = 'Нет элементов для редактриования'; 

    L.drawLocal.edit.toolbar.actions.save.text = "Сохранить";
    L.drawLocal.edit.toolbar.actions.cancel.text = "Отмена";
    L.drawLocal.edit.toolbar.actions.clearAll.text = "Очистить все";

    //handlers
    L.drawLocal.draw.handlers.marker.tooltip.start = "Нажмите на карту, чтобы поместить маркер";

    L.drawLocal.draw.handlers.polygon.tooltip.start = "Нажмите, чтобы начать рисовать";
    L.drawLocal.draw.handlers.polygon.tooltip.cont = "Нажмите, чтобы продолжить рисовать";
    L.drawLocal.draw.handlers.polygon.tooltip.end = "Нажмите на первую точку, чтобы завершить рисование";

    L.drawLocal.draw.handlers.polyline.tooltip.start = "Нажмите, чтобы начать рисовать линию";
    L.drawLocal.draw.handlers.polyline.tooltip.cont = "Нажмите, чтобы продолжить рисовать линию";
    L.drawLocal.draw.handlers.polyline.tooltip.end = "Нажмите на последнюю точку, чтобы завершить рисование";
    L.drawLocal.draw.handlers.polyline.error = "<strong>Ошибка</strong> Узлы фигур не могут пересекаться";

    L.drawLocal.draw.handlers.rectangle.tooltip.start = "Нажмите и двигайте мышь, чтобы нарисовать прямоугольник";

    L.drawLocal.edit.handlers.edit.tooltip.text = "Перетаскивай мышью для редактирования";
    L.drawLocal.edit.handlers.edit.tooltip.subtext = "Нажми Отмена, чтобы вернуть всё как было";
    L.drawLocal.edit.handlers.remove.tooltip.text = "Нажми на полигон для удаления";
   

    function onDrawFeatureAdd(e) {
        var type = e.layerType,
        layer = e.layer;
        layer.properties = {};
        layer.options.title='';
        layer.bindPopup('', {minWidth : 250});
        set_popup_content(layer);
        MAP_CONFIG.editable_layers.addLayer(layer);
        layer.openPopup();
    };

    var drawControl = new L.Control.Draw(draw_options);
    MAP_CONFIG.map.addControl(drawControl);
    MAP_CONFIG.map.on(L.Draw.Event.CREATED, onDrawFeatureAdd);
};