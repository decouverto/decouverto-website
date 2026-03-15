module.exports = ['$scope', '$http', '$rootScope', 'notie', '$routeParams', '$location', function ($scope, $http, $rootScope, notie, $routeParams, $location) {
    $scope.covers = [];

    // Load available music covers
    $http.get('/music_cover/music-cover.json').success(function (data) {
        $scope.covers = data;
    }).error(function () {
        $scope.covers = [];
    });

    $http.get('/api/songs/' + $routeParams.id).success(function (data) {
        $scope.song = data;
    }).error($rootScope.$error);

    // Get cover image URL for preview
    $scope.getCoverImageUrl = function () {
        if (!$scope.song || !$scope.song.cover) return null;
        return '/music_cover/' + $scope.song.cover + '.png';
    };

    $scope.updateSong = function () {
        notie.confirm('Êtes-vous sûre de vouloir modifier cette chanson ?', 'Oui', 'Annuler', function () {
            $http.put('/api/songs/' + $routeParams.id, {
                title: $scope.song.title,
                description: $scope.song.description,
                cover: $scope.song.cover || null
            }).success(function () {
                notie.alert(1, 'La chanson a été mise à jour avec succès.', 3);
                $location.path('/list-songs/');
            }).error($rootScope.$error);
        });
    };
}];
