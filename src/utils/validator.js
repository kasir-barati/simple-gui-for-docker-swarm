class Validator {
    static isUrl (url) { return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(url) };

    static isBool (bool) { return typeof bool === 'boolean' };
    
    static isEmail (email) { return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email) };
    
    /**
     * whenever the phone 0910XXXXXXX 0901XXXXXXX, ...
     * @param {String} phone 
     */
    static isPhone (phone) { return /(0|\+98)?([ ]|,|-|[()]){0,2}9[0|1|2|3|4]([ ]|,|-|[()]){0,2}(?:[0-9]([ ]|,|-|[()]){0,2}){8}/.test(phone) };
    
    /**
     * Is it number
     * @param {Float} number 
     */
    static isNumeric (number) { return !isNaN(parseFloat(number)) && isFinite(number) };
    
    /**
     * check length of the given string
     * @param {Number} length maximum length
     * @param {String} text A string
     * @return {Boolean} true if length of text is smaller than length
     */
    static isSmallerThan (length, text) { return text.length < length };

    static isPassword (password) { return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password) };
    
    static isDockerName (value) { return /^[a-zA-Z0-9][a-zA-Z0-9-._]/.test(value) };
    
    static isAlphanumeric (value) { return /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 =:_.-]+)$/.test(value) };

    /**
     * validate project name
     * @param {string} value project name
     * @return {boolean}
     */
    static isValidForProjectName (value) { return /^([a-zA-Z0-9_.-]+)$/.test(value) };

    static compare(var1, var2) { return var1.localeCompare(var2) };

    static isUuid (uuid) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid) };

    static isPicture (file) { return /(gif|jpe?g|tiff|png|webp|bmp)$/i.test(file) };

    static isPng (file) { return /(png)$/i.test(file) };

    static isZip (file) { return /(zip)$/i.test(file) };

    // static returnError (error) {
    //     console.error(error);
    //     if (error.code === "ENOTFOUND") {
    //         return {
    //             "data": "error not found",
    //             "status": error.response.status
    //         };
    //     } else if (error.code === "ECONNREFUSED") {
    //         return {
    //             "status": 502,
    //             "data": "we can not connect to docker server. please try later"
    //         };
    //     } else if (error.code === "EHOSTUNREACH") {
    //         return {
    //             "status": 502,
    //             "data": "we can not connect to docker server. please try later"
    //         };
    //     } else if(error.code === "ENETUNREACH") {
    //         return {
    //             "data": error.code,
    //             "status": 500
    //         };
    //     } else {
    //         return {
    //             "data": error.response ? error.response.statusText  + ". " + error.response.data.message : 'An internall error.',
    //             "status": error.response ? error.response.status : 500
    //         };
    //     };
    // };
};

module.exports = Validator;