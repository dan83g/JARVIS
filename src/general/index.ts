import {main_menu, menu_button} from './controls';
import {set_user_label} from './func';
import {Config} from './config';

//загружаем настройки
var CONFIG = new Config();
CONFIG.load_setting_sync();

// динамически подгружаем скин
let user_skin = CONFIG.skin == 'dark' ? "compact" : CONFIG.skin;
CONFIG.dyn_load_css("/static/cdn/webix/6.4.0/skins/" + user_skin + ".min.css");

export {CONFIG, main_menu, menu_button, set_user_label}