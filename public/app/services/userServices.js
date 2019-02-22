/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>

angular.module('userServices',[])

.factory('Userr',function($http){
    userFactory = {};
    var forms = {};

    userFactory.setForms = function(value){
        forms.value = value;
        
    }

    userFactory.getForms = function(){
        return forms.value;
    }

    //User.create(regData);
    userFactory.create = function(regData){
        return $http.post('/api/users',regData);
    };
    
    // Activate User's Account
    userFactory.activeAccount = function(token){
        console.log('comes to service');
        return $http.post('/api/activate/' + token); 
    };
    
    // Resend User's Activation Link
    userFactory.resendLink = function(userName){
        return $http.post('/api/resend/' + userName);
    };

    // Send new password to user
    userFactory.sendPassword = function(userData){
        return $http.get('/api/resetPassword/' + userData);
    };

    // Activate the new password
    userFactory.activatePassword = function(token){
        return $http.get('/api/activatePass/' + token);
    };

    // Load All Cars to DB
    userFactory.addCarsToDB = function(){
        return $http.post('/api/createCarsDB');
    };

    // Get Result of matched Cars
    userFactory.getResult = function(carData){
        return $http.post('/api/formResult',carData);
    };


    // Go to Google Authentication
    userFactory.googleAuthentication = function(){
        return $http.get('/api/googleAuth');
    }

    // get Credentials
    userFactory.getCredentials = function(code){
        return $http.get('/api/googleToken?code=' + code);
    }

    // get User's desired sheet
    userFactory.getSheet = function(ID){
        return $http.get('/api/getSheetByID?ID=' + ID);
    }

    return userFactory;
});

