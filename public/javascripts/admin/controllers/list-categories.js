module.exports = ['$scope', '$http', '$rootScope', 'notie', '$location', function ($scope, $http, $rootScope, notie, $location) {
    $scope.categories={
        sectors: [],
        themes: []
    };
    $http.get('/api/walks/categories/uri').success(function(data) {
        $scope.categories.sectors = data.sectors;
        $scope.categories.themes = data.themes;
    }).error($rootScope.$error);

}];