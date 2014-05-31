var FBUI = angular.module('FBUI', [
    'btford.socket-io',
    'FBUIControllers',
    'FBUIServices',
    'FBUIFilters'
]);

angular.element(document.getElementById('playpause'))
    .removeClass('glyphicon-play')
    .addClass('{{(status.playBackStatus === "playing") && "glyphicon-pause" || "glyphicon-play"}}');
