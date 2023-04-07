// decode unicode functiion
export function b64DecodeUnicode(b64string: string): string {
    let utf16 = atob(b64string);
    var cp = [];
    for( var i = 0; i < utf16.length; i+=2) {
        cp.push( 
            utf16.charCodeAt(i) |
            ( utf16.charCodeAt(i+1) << 8 )
        );
    }
    return String.fromCharCode.apply( String, cp );
}