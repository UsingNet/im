
var search = {};
location.search.substr(1).split('&').filter(function(i) {
    return i; }).map(function(value) {
    var split = value.split('=');
    search[split[0]] = decodeURIComponent(split[1]);
});

export default function search(key) {
    return search[key];
}
