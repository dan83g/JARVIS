function encode(r) {
    return r.variables.remote_user.toString('base64');   
}

function decode(r) {
    return encodeURIComponent(r.variables.user);
}

export default {encode, decode};