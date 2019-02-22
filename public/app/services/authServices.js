/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>

angular.module('authServices',[])

.factory('auth',function($http,authToken){
   var authFactory = {};

    //User.create(regData);
    authFactory.login = function(logData){
        return $http.post('/api/authenticate',logData).then(function(data){
            authToken.setToken(data.data.token);
            return data;
        });
    };

    //auth.isLoggedIn();
    authFactory.isLoggedIn = function(){
        if(authToken.getToken()){
            return true;
        }else{
            return false;
        }
    };

    authFactory.getUser = function(){
        if(authToken.getToken()){
            return $http.post('/api/currentUser');
        }else{
            $q.reject({message: 'User has no token.'})
        }
    };

    //auth.logout();
    authFactory.logOut = function(){
        authToken.setToken();
    };

    return authFactory;
})

.factory('authToken',function($window){
    var authTokenFactory = {};

   
    authTokenFactory.setToken = function(token){
        if(token){
            $window.localStorage.setItem('token',token);
        }else{
            $window.localStorage.removeItem('token');
        }
    };

    authTokenFactory.getToken = function(){
        return $window.localStorage.getItem('token');
    };

    return authTokenFactory;
})

.factory('authIntercepters',function(authToken){ 
    var authInterceptersFactory = {};
    authInterceptersFactory.request = function(config){
        var token = authToken.getToken();
       
        if(token){
            config.headers['x-access-token'] = token;
        }

        return config;
        
    };

    return authInterceptersFactory;
});

