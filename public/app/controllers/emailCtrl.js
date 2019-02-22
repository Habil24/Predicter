/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>

angular.module('emailController',['userServices'])

    .controller('emailCtrl',function($routeParams,Userr,$timeout,$location){

        app = this;
        //console.log($routeParams.token);
        Userr.activeAccount($routeParams.token).then(function(data){
            app.successMessage = false;
            app.errorMessage = false;

            if(data.data.success){
                app.successMessage = data.data.message + " Redirecting...";
                $timeout(function(){
                    $location.path('/login');
                },2500);
            }else{
                app.errorMessage = data.data.message + 'Redirecting...';
                $timeout(function(){
                    $location.path('/login');
                },2500);
            }
        });

    
    })
    .controller('resendCtrl',function(Userr, $scope,$timeout,$location){
        app = this;
        $scope.resendLink = function(main) {
            var resendLinkPromise = Userr.resendLink(main);
            resendLinkPromise.then(function(data){
                if(data.data.success){
                    app.successMessage = data.data.message + "Redirecting...";
                    $timeout(function(){
                        $location.path('/');
                    },2500);
                }
                else{
                    app.errorMessage = data.data.message + "Redirecting...";
                    $timeout(function(){
                        $location.path('/');
                    },2500);
                }
            });

        };          
    })

    // PASSWORD RESET CONTROLLER
    .controller('passwordCtrl',function(Userr,$timeout,$location){
        app = this;
       
        // Function that will be fired on reset Password button
        app.sendPassword = function(userData){
            app.errMessage = false;
            app.loading = true;
            Userr.sendPassword(app.userData.email).then(function(data){
                if(data.data.success){
                    app.successMessage = data.data.message + " Redirecting...";
                    $timeout(function(){
                        $location.path('/');
                    },2500);
                }else{
                    app.errMessage = data.data.message;
                }
            });
        };
       
    })
    // Controller for Activation of Password Link
    .controller('passActivationCtrl',function(Userr,$timeout,$location,$routeParams){
        app = this;
        Userr.activatePassword($routeParams.token).then(function(data){
            if(data.data.success){
                app.successMessage = data.data.message + " Redirecting...";
                $timeout(function(){
                    $location.path('/');
                },2500);
            }
        });
    });