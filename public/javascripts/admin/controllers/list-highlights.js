module.exports = ['$scope', '$http', '$rootScope', 'notie', function ($scope, $http, $rootScope, notie) {
    $scope.walks=[];
    $scope.highlights=[];

    var join = function (walks, highlights) {
        walks.forEach(function (element) {
            for (var k in highlights) {
                if (highlights[k].walk_id == element.id) {
                    highlights[k].title = element.title;
                }
            }
        });
        return [walks, highlights];
    }

    $http.get('/api/walks').success(function(walks) {
        $http.get('/api/highlights').success(function(highlights) {
            result_join = join(walks, highlights);
            $scope.walks = result_join[0];
            $scope.highlights = result_join[1];
        }).error($rootScope.$error);
    }).error($rootScope.$error);

    $scope.addHighlight = function(walk_id) {
        for (var k in $scope.highlights) {
            if  ($scope.highlights[k].walk_id == walk_id) {
                return notie.alert(3, 'Le parcours est déjà ajouté aux favoris.', 3);
            }
        }
        $http.post('/api/highlights/', {
            walk_id: walk_id
        }).success(function (res) {
            $scope.highlights.push({id: res.id, walk_id: walk_id});
            join($scope.walks, $scope.highlights);
            notie.alert(1, 'Le parcours a été ajouté aux favoris.', 3);
        }).error($rootScope.$error);
    }

    $scope.removeHighlight = function (id) {
        $http.delete('/api/highlights/' + id).success(function() {
            notie.alert(1, 'Le parcours a été supprimé des favoris.', 3);
            for (var k in $scope.highlights) {
                if  ($scope.highlights[k].id == id) {
                    $scope.highlights.splice(k, 1); 
                }
            }
        }).error($rootScope.$error);
    };
}];