module.exports = ['$scope', '$http', '$rootScope', 'notie', '$routeParams', '$location', function ($scope, $http, $rootScope, notie, $routeParams, $location) {
    $http.get('/api/songs/' + $routeParams.id).success(function (data) {
        $scope.song = data;
    }).error($rootScope.$error);

    $scope.updateSong = function () {
        notie.confirm('Êtes-vous sûre de vouloir modifier cette chanson ?', 'Oui', 'Annuler', function () {
            $http.put('/api/songs/' + $routeParams.id, {
                title: $scope.song.title,
                description: $scope.song.description
            }).success(function () {
                notie.alert(1, 'La chanson a été mise à jour avec succès.', 3);
                $location.path('/list-songs/');
            }).error($rootScope.$error);
        });
    };
}];
