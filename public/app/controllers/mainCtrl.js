/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>

angular.module('mainController',['authServices'])

.controller('mainCtrl',function(auth,$timeout,$location, $rootScope){
    //console.log('testing main controller');
    var app = this;

    app.loadMe = false;
    
    $rootScope.$on('$routeChangeStart',function(){
        if(auth.isLoggedIn()){
            app.isLoggedIn = true;
            auth.getUser().then(function(data){
                app.userName = data.data.username;
                app.userEmail = data.data.email;
                app.loadMe = true;
            });
        }else{
            app.isLoggedIn = false;
            app.userName = '';
            app.loadMe = true;
        }
    });
    
    this.doLogin = function(logData){
        app.loading = true;
        app.errMessage = false;
        app.expired = false;
        app.disabled = true;

        auth.login(app.logData).then(function(data){
            if(data.data.success){
                app.loading = false;
                // create success page
                app.successMessage = data.data.message + 'Redirecting...';
                 // redirect to home page
                $timeout(function(){
                    $location.path('/myProfile');
                    app.logData = '';
                    app.successMessage = false;
                },3000);
            }else{
                if(data.data.expired){
                    // create an error message
                    app.expired = true;
                    app.loading = false;
                    app.errMessage = data.data.message;
                    
                }else{
                     // create an error message
                     app.loading = false;
                     app.disabled = true;
                     app.errMessage = data.data.message;
                }
            }
        });
    };

    this.logOut = function(){
        auth.logOut();
        $location.path('/logOut');
        $timeout(function(){
            $location.path('/');
        },3000);
    };
})



