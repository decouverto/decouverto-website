module.exports = ['$scope', '$http', '$rootScope', 'Upload', 'notie', function ($scope, $http, $rootScope, Upload, notie) {
    $scope.uploading = false;
    $scope.preview = false;

    $scope.upload = function () {
        var reader = new FileReader();
        reader.readAsText($scope.desc);
        reader.onload = function() {
            try {
                var obj = JSON.parse(reader.result);
                console.log(obj)
            } catch (e) {
                notie.alert(3, 'Fichier JSON invalide.', 3);
                $scope.uploading = false;
            }
        };
    }

    $scope.generatePreview = function () {
        var reader = new FileReader();
        reader.readAsText($scope.desc);
        reader.onload = function() {
            try {
                $scope.preview = JSON.stringify(JSON.parse(reader.result), null, '\t');
            } catch (e) {
                $scope.preview = false;
            }
        };
    }
}];