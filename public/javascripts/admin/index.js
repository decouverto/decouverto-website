require('angular'); /*global angular*/
require('angular-route');
require('ng-notie');
require('ng-file-upload');
require('./tinymce/javascripts/tinymce.min.js');
require('./tinymce/javascripts/ui-tinymce.js');


var app = angular.module('Decouverto', ['ngNotie', 'ngRoute', 'ngFileUpload', 'ui.tinymce']);
app.config(['$routeProvider', function($routeProvider) {
        // Route configuration
        $routeProvider
        .when('/', {
            templateUrl: '/views/home.html',
            controller: 'HomeCtrl'
        })
        .when('/publish/', {
            templateUrl: '/views/publish.html',
            controller: 'PublishCtrl'
        })
        .when('/list-walks/', {
            templateUrl: '/views/list-walks.html',
            controller: 'ListWalksCtrl'
        })
        .when('/metas/', {
            templateUrl: '/views/metas.html',
            controller: 'MetasCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);
app.run(['$rootScope', '$location', 'notie', function ($rootScope, $location,  notie) {
    $rootScope.$error = function () { // Send message error
        notie.alert(3, 'Une erreur est survenue.', 3);
    }
    $rootScope.$goTo = function (path) {
        $location.path(path);
    }
}]);
app.controller('HomeCtrl', require('./controllers/home.js'));
app.controller('PublishCtrl', require('./controllers/publish.js'));
app.controller('ListWalksCtrl', require('./controllers/list-walks.js'));
app.controller('MetasCtrl', require('./controllers/metas.js'));