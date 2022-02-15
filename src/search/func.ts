// secondary search
export function search(aHref: string, aMode: number): void {
    if (aHref.indexOf("://")==-1){
        let site = document.location;
        aHref = site.protocol+"//" + site.host + aHref;    
    }

    switch(aMode){
        case 0:{
            webix.send(aHref, null, "GET", "_self");
            break;
        }        
        case 1:{
            webix.send(aHref, null, "GET", "_blank");
            break;
        }
        case 2:{
            var left = screen.availHeight/2 - 360;
            var top = screen.availHeight/2 - 640;
            let newWindow: Window = window.open(
                aHref,
                'Поиск',
                'width=1280, height=720, location=yes, left=' + left + ', top=' + top + ' resizable=yes, scrollbars=yes, status=yes'
            );
            newWindow.focus();
            break;
        }
        //default                                                        
        default:
        {     
            webix.send(aHref, null, "GET", "_self");
            break;
        };
    }
}