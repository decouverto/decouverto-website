module.exports = ['$scope', '$http', '$rootScope', 'Upload', 'notie', '$location', function ($scope, $http, $rootScope, Upload, notie, $location) {
    $scope.progress = false;
    $scope.covers = [];

    // Load available music covers
    $http.get('/music_cover/music-cover.json').success(function (data) {
        $scope.covers = data;
    }).error(function () {
        $scope.covers = [];
    });

    // Get cover image URL for preview
    $scope.getCoverImageUrl = function () {
        if (!$scope.cover) return null;
        return '/music_cover/' + $scope.cover + '.png';
    };

    $scope.upload = function () {
        if (!$scope.title || !$scope.description || !$scope.audio) {
            notie.alert(3, 'Veuillez remplir tous les champs.', 3);
            return;
        }

        // Generate ID from title
        var id = $scope.title.toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        Upload.upload({
            url: '/api/songs/',
            data: {
                id: id,
                title: $scope.title,
                description: $scope.description,
                audio: $scope.audio,
                cover: $scope.cover || null
            }
        }).then(function () {
            notie.alert(1, 'La chanson a été sauvegardée.', 3);
            $location.path('/list-songs/');
        }, function () {
            $scope.progress = false;
            notie.alert(3, 'Une erreur a eu lieu lors de l\'envoie du fichier.', 3);
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    };
}];
