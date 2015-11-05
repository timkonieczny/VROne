var VROne = {};

//for node.js
if(typeof module !== 'undefined')module.exports = VROne;
if(typeof navigator === 'undefined')navigator = {};


VROne.requestAnimFrame = function(func){
    var req = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
        window.setTimeout(callback, 1000/60);
        };
    req.call(window, func);
};