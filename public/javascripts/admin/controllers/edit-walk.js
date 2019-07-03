module.exports = ['$scope', '$http', '$rootScope', 'notie', '$routeParams', '$location', function ($scope, $http, $rootScope, notie, $routeParams, $location) {
    $http.get('/api/walks/' + $routeParams.id).success(function(data) {
        $scope.walk = data;
        $scope.url = 'https://decouverto.fr/rando/' + $routeParams.id
    }).error($rootScope.$error);
    $http.get('/api/walks/categories').success(function(categories) {
        $scope.existsTheme = true;
        $scope.existsZone = true;
        $scope.categories = {
            themes: categories.themes.sort(),
            sectors: categories.sectors.sort()
        };
        $scope.checkTheme = function (theme) {
            var e = false;
            for (var k in categories.themes) {
                if (theme == categories.themes[k]) {
                    e = true;
                    break;
                }
            }
            $scope.existsTheme = e;
        }
        $scope.checkZone = function (zone) {
            var e = false;
            for (var k in categories.sectors) {
                if (zone == categories.sectors[k]) {
                    e = true;
                    break;
                }
            }
            $scope.existsZone = e;
        }
        $scope.showSectors = false;
        $scope.showTheme = false;
    }).error($rootScope.$error);

    $scope.updateWalk = function () {
        notie.confirm('Êtes-vous sûre de vouloir supprimer ce parcours ?', 'Oui', 'Annuler', function() {
            $http.put('/api/walks/' + $routeParams.id, {
                title: $scope.walk.title,
                description: $scope.walk.description,
                zone: $scope.walk.zone,
                theme: $scope.walk.theme,
                fromBook: $scope.walk.fromBook                
            }).success(function() {
                notie.alert(1, 'Le parcours a été mise à jour avec succès.', 3);
                $location.path('/list-walks/');
            }).error($rootScope.$error);
        });
    };

    
}];