module.exports = ['$scope', '$http', '$rootScope', 'notie', '$location', function ($scope, $http, $rootScope, notie, $location) {
    $scope.walks=[];
    $http.get('/api/stats').success(function(data) {
        $scope.walks = data;
    }).error($rootScope.$error);

    $scope.removeWalk = function (id) {
        notie.confirm('Êtes-vous sûre de vouloir supprimer ce parcours ?', 'Oui', 'Annuler', function() {
            $http.delete('/api/walks/' + id).success(function() {
                notie.alert(1, 'Le parcours a été supprimé avec succès.', 3);
                $location.path('/');
            }).error($rootScope.$error);
        });
    };
    $scope.resetStats = function () {
        notie.confirm('Êtes-vous sûre de mettre les statistiques à zéro ?', 'Oui', 'Annuler', function() {
            $http.get('/api/stats/reset/').success(function() {
                notie.alert(1, 'Les statistiques ont été remis à zéro.', 3);
                $scope.walks.forEach(function (el) {
                    if (el.web != null) el.web = 0;
                    if (el.app != null) el.app = 0;
                });
            }).error($rootScope.$error);
        });
    };
}];