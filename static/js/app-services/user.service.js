(function () {
    'use strict';

    angular
        .module('campui')
        .factory('UserService', UserService);

    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};

        service.GetAll = GetAll;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get('/api/user/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Update(user) {
            return $http.put('/api/user/' + user.username, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/user/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return { success: true };
        }

        function handleError(res) {
                return { success: false, message: res.data.message };
        }
    }

})();
