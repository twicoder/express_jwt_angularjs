
(function () {
    'use strict';

    var myapp = angular
        .module('myapp',['ngStorage']);

    myapp.run(run);

    function run($rootScope, $http, $location, $localStorage) {
        // keep user logged in after page refresh
        if ($localStorage.currentUser) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
        }

        // redirect to login page if not logged in and trying to access a restricted page
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var publicPages = ['/login'];
            var restrictedPage = publicPages.indexOf($location.path()) === -1;
            if (restrictedPage && !$localStorage.currentUser) {
                $location.path('/login');
            }
        });
    }


    myapp.controller('loginController', Controller);

    function Controller($scope, $http, $location, AuthenticationService) {

        var vm = this;

        vm.login = login;
        vm.title = "This is my test!";

        initController();

        function initController() {
            // reset login status
            AuthenticationService.Logout();
        };

        function login() {
            vm.loading = true;
            console.log('vm.username:');
            console.log(vm.username);
            console.log('vm.password:');
            console.log(vm.password);
            AuthenticationService.Login(vm.username, vm.password, function (result) {
                console.log('result:');
                console.log(result);
                if (result.success === true) {
                    $location.path('/login');
                } else {
                    vm.error = 'Username or password is incorrect';
                    vm.loading = false;
                }
            });
        };
    }

})();