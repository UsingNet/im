var generateStr = function() {
    return parseInt(Math.random() * Math.pow(10, 10)).toString(32);
};

var generateKey = function() {
    var key = parseInt((new Date()).getTime() * Math.pow(10, 4) +
        Math.random() * Math.pow(10, 4)).toString(32);
    while (key.length < 32) {
        key += generateStr();
    }
    return key.substr(0, 32);
};

export default generateKey;
