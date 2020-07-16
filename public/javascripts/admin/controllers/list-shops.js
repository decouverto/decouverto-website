module.exports = ['$scope', '$http', '$rootScope', 'notie', '$location', function ($scope, $http, $rootScope, notie, $location) {
    $scope.shops=[];
    $http.get('/api/shops').success(function(data) {
        $scope.shops = data;
    }).error($rootScope.$error);
    
    $scope.removeShop = function (id) {
        notie.confirm('Êtes-vous sûre de vouloir supprimer ce point de vente ?', 'Oui', 'Annuler', function() {
            $http.delete('/api/shops/' + id).success(function() {
                notie.alert(1, 'Le point de vente a été supprimé avec succès.', 3);
                $location.path('/');
            }).error($rootScope.$error);
        });
    };
}];