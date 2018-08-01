module.exports = ['$scope', '$http', '$rootScope', 'notie', '$routeParams', function ($scope, $http, $rootScope, notie, $routeParams) {
    $scope.walks=[];
    $http.get('/api/walks/' + $routeParams.id).success(function(data) {
        $scope.walk = data;
    }).error($rootScope.$error);

    $scope.updateWalk = function () {
        notie.confirm('Êtes-vous sûre de vouloir supprimer ce parcours ?', 'Oui', 'Annuler', function() {
            $http.put('/api/walks/' + $routeParams.id, {
                title: $scope.walk.title,
                description: $scope.walk.description
            }).success(function() {
                notie.alert(1, 'Le parcours a été mise à jour avec succès.', 3);
                $location.path('/');
            }).error($rootScope.$error);
        });
    };
}];