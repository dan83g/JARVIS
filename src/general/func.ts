
export function set_user_label(label: webix.ui.label, CONFIG: any): void{
    label.setValue("<span class='fas fa-user header_label smoked'> " + ((CONFIG.firstname && CONFIG.lastname) ? CONFIG.firstname + " " + CONFIG.lastname : CONFIG.username) + "</span>");
}