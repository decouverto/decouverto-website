module.exports = ['$scope', '$routeParams', 'Upload', 'notie', '$location', function ($scope, $routeParams, Upload, notie, $location) {
    $scope.progress = false;

    $scope.upload = function () {
                Upload.upload({
                    url: '/api/walks/' + $routeParams.id + '/change-zip/',
                    data: {
                        file: $scope.content
                    }
                }).then(function () {
                    notie.alert(1, 'Le fichier a été sauvegardé.', 3);
                    $location.path('/');
                }, function () {
                    $scope.progress = false;
                    notie.alert(3, 'Une erreur a eu lieu lors de l\'envoie du fichier.', 3);
                }, function (evt) {
                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                });
    }

}];