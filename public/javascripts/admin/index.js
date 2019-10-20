require('angular'); /*global angular*/
require('angular-route');
require('ng-notie');
require('ng-file-upload');
require('./tinymce/tinymce.min.js');
require('./tinymce/ui-tinymce.js');

var qrcode = require('qrcode-generator');
window.qrcode = qrcode;
require('../../../node_modules/qrcode-generator/qrcode_UTF8.js');
require('angular-qrcode');


var app = angular.module('Decouverto', ['ngNotie', 'ngRoute', 'ngFileUpload', 'monospaced.qrcode', 'ui.tinymce']);
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
        .when('/list-categories/', {
            templateUrl: '/views/list-categories.html',
            controller: 'ListCategoriesCtrl'
        })
        .when('/edit-walk/:id', {
            templateUrl: '/views/edit-walk.html',
            controller: 'EditWalkCtrl'
        })
        .when('/list-shops/', {
            templateUrl: '/views/list-shops.html',
            controller: 'ListShopsCtrl'
        })
        .when('/edit-shop/:id', {
            templateUrl: '/views/edit-shop.html',
            controller: 'EditShopCtrl'
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
app.controller('ListCategoriesCtrl', require('./controllers/list-categories.js'));
app.controller('EditWalkCtrl', require('./controllers/edit-walk.js'));
app.controller('ListShopsCtrl', require('./controllers/list-shops.js'));
app.controller('EditShopCtrl', require('./controllers/edit-shop.js'));
app.controller('MetasCtrl', require('./controllers/metas.js'));