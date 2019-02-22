/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>


angular.module('extrasControllers', ['userServices'])

    .controller('googleFormsCtrl', function ($scope, $http, $window, Userr,$timeout,$location) {
        // SEND THE HTTP REQUEST
        var url;
        var externalWindow;
        // MAKE API REQUEST for Authorization
        $http.get('/api/googleAuth').then(function (response) {
            url = response.data;
        });

        this.googleAuthentication = function () {
            externalWindow = $window.open(url, "Please Sign in with Google", "width:350px,height:350px");
        };
        // Close Authorization and set credentials
        window.onmessage = function (info) {
            externalWindow.close();
            // Get the URL
            var urlCode = info.data;

            // Get pure code of user
            var idx = urlCode.lastIndexOf("code=");
            var code = urlCode.substring(idx + 5).replace("#", "");

            // GET ALL FORMS
            Userr.getCredentials(code).then(function (res) {
                Userr.setForms(res.data);
                $timeout(function(){
                    $location.path('/usersForms');
                },100);
            });

            
        };
    })
    .controller('GoogleAuthCallback', function ($scope, $http) {
        this.googleAuthentication = function () {
            window.opener.postMessage("My URL is : " + location.href, "*");
        };
    })
    .controller('getSheetData', function (Userr,$scope) {
        $scope.forms = Userr.getForms();

        // Gets the Selected Sheet's ID
        this.getSheetID = function(selectedFormID){ 
            Userr.getSheet(selectedFormID).then(function(res){
                console.log(res.data);
            });  
        }
        
    })
    ;


