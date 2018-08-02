module.exports = ['$scope', '$http', '$rootScope', 'notie', '$location', function ($scope, $http, $rootScope, notie, $location) {
    $scope.metas = [
        {
            id: 'short_desc',
            name: 'Description courte',
            note: 'Description affiché sur Google et en partagant le site',
            type: 'text',
            value: ''
        },
        {
            id: 'long_desc',
            name: 'Description longue',
            note: 'Description affiché sur la page d\'accueil',
            type: 'text',
            value: ''
        },
        {
            id: 'app_doc',
            name: 'Documentation application',
            note: 'Paragraphe affiché sur la page d\'accueil pour expliquer le fonctionnement de l\'application',
            type: 'html',
            value: ''
        },
        {
            id: 'books',
            name: 'Livres',
            type: 'html',
            value: ''
        }
    ];
 
    $scope.tinymceOptions = {
        inline: false,
        skin: 'lightgray',
        theme: 'modern'
    };

    $http.get('/api/metas').success(function (data) {
        $scope.metas.forEach(function (el) {
            if (data.hasOwnProperty(el.id)) {
                el.value = data[el.id];
            }
        });
    }).error($rootScope.$error);

    $scope.updateMeta = function (meta) {
        notie.confirm('Êtes-vous sûre de vouloir modifier "' + meta.name.toLowerCase() + '" ?', 'Oui', 'Annuler', function () {
            $http.put('/api/metas/' + meta.id, {
                value: meta.value
            }).success(function () {
                notie.alert(1, '"' + meta.name.toLowerCase() + '" a été modifié.', 3);
            }).error($rootScope.$error);
        });
    };
}];