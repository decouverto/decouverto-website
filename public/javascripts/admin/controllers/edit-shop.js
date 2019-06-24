module.exports = ['$scope', '$http', '$rootScope', 'notie', '$routeParams', '$location', function ($scope, $http, $rootScope, notie, $routeParams, $location) {
    $scope.tinymceOptions = {
        inline: false,
        skin: 'lightgray',
        theme: 'modern'
    };

    $scope.shop = {};

    if ($routeParams.id == 'new') {
        $scope.new = true;
        $scope.addShop = function () {
            if ($scope.title != '' && $scope.latitude != '' && $scope.longitude != '' && $scope.description != '' && $scope.address != '') {
                $http.post('/api/shops/', {
                    title: $scope.shop.title,
                    description: $scope.shop.description,
                    latitude: $scope.shop.latitude,
                    longitude: $scope.shop.longitude,
                    address: $scope.shop.address
                }).success(function () {
                    notie.alert(1, 'Le point de vente a été mise à jour avec succès.', 3);
                    $location.path('/list-shops/');
                }).error($rootScope.$error);
            }
        }
    } else {
        $scope.updateShop = function () {
            notie.confirm('Êtes-vous sûre de vouloir modifier ce point de vente ?', 'Oui', 'Annuler', function () {
                $http.put('/api/shops/' + $routeParams.id, {
                    title: $scope.shop.title,
                    description: $scope.shop.description,
                    latitude: $scope.shop.latitude,
                    longitude: $scope.shop.longitude,
                    address: $scope.shop.address,
                }).success(function () {
                    notie.alert(1, 'Le point de vente a été mise à jour avec succès.', 3);
                    $location.path('/list-shops/');
                }).error($rootScope.$error);
            });
        }
        $scope.new = false;
        $http.get('/api/shops/' + $routeParams.id).success(function (data) {
            $scope.shop = data;
        }).error($rootScope.$error);
    }
}];