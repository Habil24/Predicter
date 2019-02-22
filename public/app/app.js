/// <reference  path="assets/angular.min.js"/>
/// <reference  path="assets/angular-route.min.js"/>

angular.module('userApp',['appRoutes','userControllers','userServices','ngAnimate','mainController','authServices','carControllers','extrasControllers','emailController'])



.config(function($httpProvider){
    $httpProvider.interceptors.push('authIntercepters');
});

