/**
 * Search function
 * @param {text} text 
 * @param {callback(succsess, response)} callback
 */
function search(text, callback){
    $.ajax({
        url: "/api?search=" + text,
        dataType:  "text",
        success: (response) =>{
            if(isJson(response)){
                callback(true, JSON.parse(response));
            } else{
                callback(false, null);
                console.log(response)
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            callback(false, null);
            ajaxError(xhr + " " + ajaxOptions + " " + thrownError);
        }
    });
}

/**
 * @todo
 * @param {text} message message to display
 */
function ajaxError(message){
    alert(message);
}

function isJson(text){
    return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
}

/**
 * js API
 */

/**
 * js get api
 * @param {text} property property to be called from the server
 * @param {text / number} data data to be send mostly ids
 */
function get(property, data1, data2){
    const promise = {
        receive: (callback) => {promise.callback = callback},
        callback: () => {console.log("no callback")}
    }
    let url = `/api?get${property}=${data1}`;
    if(data2 !== undefined){
        url += `&data=${data2}`;
    }
    // console.log(url)
    $.ajax({
        type: "GET",
        url,
        dataType:  "text",
        success: (response) =>{
            if(isJson(response) && response.length > 0){
                promise.callback(true, JSON.parse(response));
            } else{
                console.log("Response from get" + property + " was empty");
                promise.callback(false, null);
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            promise.callback(false, null);
            ajaxError(xhr + " " + ajaxOptions + " " + thrownError);
        }
    });
    return promise;
}