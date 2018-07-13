module.exports = ['$scope', '$http', '$rootScope', 'Upload', 'notie', '$location', function ($scope, $http, $rootScope, Upload, notie, $location) {
    $scope.preview = false;
    $scope.progress = false;

    $scope.upload = function () {
        var reader = new FileReader();
        reader.readAsText($scope.desc);
        reader.onload = function () {
            try {
                var obj = JSON.parse(reader.result);
                obj.file = $scope.content;
                Upload.upload({
                    url: 'api/walks/',
                    data: obj
                }).then(function () {
                    notie.alert(1, 'Le fichier a été sauvegardé.', 3);
                    $location.path('/');
                }, function () {
                    $scope.progress = false;
                    notie.alert(3, 'Une erreur a eu lieu lors de l\'envoie du fichier.', 3);
                }, function (evt) {
                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                });
            } catch (e) {
                notie.alert(3, 'Fichier JSON invalide.', 3);
            }
        };
    }

    $scope.generatePreview = function () {
        var reader = new FileReader();
        reader.readAsText($scope.desc);
        reader.onload = function () {
            try {
                $scope.preview = JSON.stringify(JSON.parse(reader.result), null, '\t');
            } catch (e) {
                $scope.preview = false;
            }
        };
    }
}];