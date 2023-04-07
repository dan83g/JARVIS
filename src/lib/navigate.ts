// search function
export function search(aHref: string, aMode: number) {
    if (aHref.indexOf("://") === -1) {
        let site = document.location;
        aHref = site.protocol + "//" + site.host + aHref;
    }
    switch (aMode) {
        case 0: {
            window.location.href = aHref;
            // webix.send(aHref, null, "GET", "_self");
            break;
        }
        case 1: {
            window.location.href = aHref;
            // webix.send(aHref, null, "GET", "_blank");
            break;
        }
        case 2: {
            var left = window.screen.availHeight / 2 - 360;
            var top = window.screen.availHeight / 2 - 640;
            let newWindow = window.open(aHref, 'Поиск', 'width=1280, height=720, location=yes, left=' + left + ', top=' + top + ' resizable=yes, scrollbars=yes, status=yes');
            if (newWindow) newWindow.focus();
            break;
        }
        //default                                                        
        default: {
            window.location.href = aHref;
            // webix.send(aHref, null, "GET", "_self");
            break;
        }
    }
}