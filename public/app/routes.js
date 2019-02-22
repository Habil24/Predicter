/// <reference  path="assets/angular.min.js"/>
/// <reference  path="assets/angular-route.min.js"/>


// Routing stuff with .config when here handles the cases
var app = angular.module('appRoutes',['ngRoute'])

.config(function($routeProvider,$locationProvider){
    $routeProvider.when('/',{
        templateUrl: 'app/views/pages/home.html'
    })
    .when('/about',{
        templateUrl: 'app/views/pages/about.html'
    })
    .when('/register',{
        templateUrl: 'app/views/pages/users/signUp.html',
        controller:  'regController',
        controllerAs: 'register',
        authenticated: false
    })
    .when('/myProfile',{
        templateUrl: 'app/views/pages/users/myProfile.html',
        controller: 'resendCtrl',
        controllerAs: 'resend',
        authenticated: true
    })
    .when('/login',{
        templateUrl: 'app/views/pages/users/login.html',
        authenticated: false
    })
    .when('/logOut',{
        templateUrl: 'app/views/pages/users/logOut.html',
        authenticated: true
    })
    .when('/carPredicter',{
        templateUrl: 'app/views/pages/users/carPredicter.html',
        controller:  'carData',
        controllerAs: 'carAnswers',
        authenticated: true
    })
    .when('/predictions',{
        templateUrl: 'app/views/pages/users/predictions.html',
        authenticated: true
    })
    ////////////////////////////////////////////////////////////
    .when('/activate/:token',{
        templateUrl: 'app/views/pages/users/activation/activate.html',
        controller: 'emailCtrl',
        controllerAs: 'email',
    })
    ////////////////////////////////////////////////////////////
    .when('/resetPass',{
        templateUrl: 'app/views/pages/users/reset/resetPass.html',
        controller: 'passwordCtrl',
        controllerAs: 'password',
        authenticated: false
    })
    .when('/activateNewPass/:token',{
        templateUrl: 'app/views/pages/users/reset/activateNewPass.html',
        controller:'passActivationCtrl',
        controllerAs: 'passActive',
        authenticated: false
    })
    .when('/extras',{
        templateUrl: 'app/views/pages/users/extras.html',
        authenticated: true,
        controller: "googleFormsCtrl",
        controllerAs: "gForms"
    })
    .when('/googleAuthCallback',{
        templateUrl: 'app/views/pages/users/googleAuthCallback.html',
        authenticated: true,
        controller: "GoogleAuthCallback",
        controllerAs: "gCallback"
    })
    .when('/usersForms',{
        templateUrl: 'app/views/pages/users/usersForms.html',
        authenticated: true,
        controller: "getSheetData",
        controllerAs: "gData"
    })
    .otherwise( {redirectTo: '/'} );

    // Delete hash symbol
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
});


// Prevents the user access from URL
app.run(['$rootScope','auth','$location',function($rootScope,auth,$location){
    $rootScope.$on('$routeChangeStart',function(event,next,current){
        // Restrict routes
        if(next.$$route.authenticated == true){
            if(!auth.isLoggedIn()){
                event.preventDefault();
                $location.path('/');
            }
        }else if(next.$$route.authenticated == false){
            if(auth.isLoggedIn()){
                event.preventDefault();
                $location.path('/myProfile');
            }
        }
    });
}]);

  
