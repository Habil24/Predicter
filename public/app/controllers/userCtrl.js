/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>


angular.module('userControllers',['userServices'])

// Registration controller
.controller('regController',function($http,$location,$timeout,Userr){

    var app = this;

    this.regUser = function(regData){
        app.disabled = true;
        app.loading = true;
        app.errMessage = false;

        Userr.create(app.regData).then(function(data){
            if(data.data.success){
                app.loading = false;
                // create success page
                app.successMessage = data.data.message + ' Redirecting...';
                 // redirect to home page
                $timeout(function(){
                    $location.path('/');
                },3000);
            }else{
                app.loading = false;
                app.disabled = false;
                // create an error message
                app.errMessage = data.data.message;
            }
        })
    };
});


