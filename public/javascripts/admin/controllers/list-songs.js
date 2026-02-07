module.exports = ['$scope', '$http', '$rootScope', 'notie', '$location', function ($scope, $http, $rootScope, notie, $location) {
    $scope.songs = [];
    $http.get('/api/songs').success(function (data) {
        $scope.songs = data;
    }).error($rootScope.$error);

    $scope.removeSong = function (id) {
        notie.confirm('Êtes-vous sûre de vouloir supprimer cette chanson ?', 'Oui', 'Annuler', function () {
            $http.delete('/api/songs/' + id).success(function () {
                notie.alert(1, 'La chanson a été supprimée avec succès.', 3);
                $scope.songs = $scope.songs.filter(function (song) {
                    return song.id !== id;
                });
            }).error($rootScope.$error);
        });
    };
}];
