/**
 * jslint browser: true
 */

/**
 * Creates loader for text resources
 * @class
 * @constructor
 */
VROne.XMLLoader = function () {

};

/**
 * Loads text resources
 * @param {String} url
 * @return {String} response
 */
VROne.XMLLoader.getSourceSynch = function (url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();
    return (request.status == 200) ? request.responseText : null;
};

VROne.XMLLoader.prototype = {

};