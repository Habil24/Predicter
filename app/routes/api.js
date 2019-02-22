var User = require('../models/user');
//var Answer = require('../models/car');
var jwt = require('jsonwebtoken');
var secret = "hquality";
var fs = require('fs');
var Car = require('../models/car');
var bodyparser = require('body-parser');
var carsData = fs.readFileSync("public/app/assets/cars2.json", 'utf-8');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var mongoose = require('mongoose');
var generator = require('generate-password');
var bcrypt = require('bcrypt-nodejs');
var DecisionTree = require('decision-tree');
const readline = require('readline');
const { google } = require('googleapis');
var os = require('os');
const express = require('express');
const opn = require('opn');
const path = require('path');
var passport = require("passport");
var googleDrive = require('google-drive');




module.exports = function (router) {

    // ASSIGN GLOBAL NEW PASSPORD IN ORDER TO USE IN DIFFERENT REQUESTS
    var newpass;

    // CLİENT İNFO
    const oauth2Client = new google.auth.OAuth2(
        "965406528935-lup7m2q2lc41cjlfig08pu8js3dr4lgr.apps.googleusercontent.com",
        "58Qm4fVl5iHpEfxwoZM94ic1",
        "http://127.0.0.1:2000/googleAuthCallback"
    );

    // generate a url that asks permissions for GoogleSheets
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ];

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: scopes
    });


    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'YOURGMAILACCOUNT',
            pass: 'YOURPASSWORD'
        }

    });

    // USER REGISTRATION ROUTE
    router.post('/users', function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;
        user.surname = req.body.surname;
        user.email = req.body.email;
        user.dateOfBirth = req.body.dateOfBirth;
        // Temporary Token for email activation
        user.temporaryToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        // Assign resetPassToken for password reset
        user.resetPassToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        // Handling dublication and input pass
        if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '' ||
            req.body.name == null || req.body.name == '' || req.body.surname == null || req.body.surname == '' || req.body.dateOfBirth == null || req.body.dateOfBirth == '') {
            res.json({ success: false, message: 'Ensure all the input fields were provided.' });
        } else {
            user.save(function (err) {
                // SEND INITIAL EMAIL OF ACTIVATION
                var mailOptions = {
                    from: '"Predicter: Account Activation " <predicter@info.com>',
                    to: user.email,
                    subject: 'Predicter: Account Activation',
                    text: 'Hello ' + user.name + ', thank you for registering at predicter.com. Please click on the following link to complete your activation: http://localhost:2000/activate/' + user.temporaryToken,
                    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thank you for registering at predicter.com. Please click on the link below to complete your activation:<br><br><a href="http://localhost:2000/activate/' + user.temporaryToken + '">http://localhost:2000/activate/</a>'

                };

                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message Sent');
                    };
                });
                res.json({ success: true, message: 'Account created, please check your email for activation link.' });
            });
        }
    });


    // USER LOGIN ROUTE
    router.post('/authenticate', function (req, res) {
        User.findOne({ username: req.body.username }).select('email username password active').exec(function (err, user) {
            if (err) {
                throw err;
            } else if (!user) {
                res.json({ success: false, message: 'Username does not exist!' });
            } else if (user) {
                if (req.body.password) {
                    var validPass = user.comparePassword(req.body.password);
                } else {
                    res.json({ success: false, message: 'No password provided' });
                }
                if (!validPass) {
                    res.json({ success: false, message: 'Password is incorrect!' });
                }
                // Before Login change the token
                else {
                    var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                    res.json({ success: true, message: 'User Authenticated!', token: token });
                }
            }
        });
    });

    // Activation account by means of Link
    router.post('/activate/:token', function (req, res) {
        User.findOne({ temporaryToken: req.params.token }, function (err, user) {
            if (err) {
                throw err;
            }
            var token = req.params.token;
            // verify token
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Account link has expired!' });
                } else if (!user) {
                    res.json({ success: false, message: 'Account link has expired!' });
                } else {
                    user.temporaryToken = false;
                    user.active = true;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            // SEND Email Activated mail
                            var mailOptions = {
                                from: '"Predicter: Account Activated " <predicter@info.com>',
                                to: user.email,
                                subject: 'Predicter: Account Activation',
                                text: 'Hello ' + user.name + ', your account has been activated successfully.',
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>your account has been activated successfully.'

                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Message Sent');
                                };
                            });
                        }
                    });
                    res.json({ success: true, message: 'Account activated!' });

                }
            });
        });
    });

    // RESEND EMAIL
    router.post('/resend/:userName', function (req, res) {
        User.findOne({ username: req.params.userName }).select('name username temporaryToken email').exec(function (err, user) {
            if (err) {
                throw err;
            }
            else {
                user.temporaryToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                user.save(function (err) {
                    // RESEND EMAIL OF ACTIVATION
                    var mailOptions = {
                        from: '"Predicter: Account Activation " <predicter@info.com>',
                        to: user.email,
                        subject: 'Predicter: Account Activation',
                        text: 'Hello ' + user.name + ', you have requested a new activation link from predicter. Please click on the following link to complete your activation: http://localhost:2000/activate/' + user.temporaryToken,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>you have requested a new activation link from predicter. Please click on the link below to complete your activation:<br><br><a href="http://localhost:2000/activate/' + user.temporaryToken + '">http://localhost:2000/activate/</a>'

                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('New Link Sent');
                        };
                    });
                    res.json({ success: true, message: 'A new activation link has been sent to your email, please check your email for activation link!' });
                });
            }
        });
    });


    /// PASSWORD RESET BY EMAIL HERE
    router.get('/resetPassword/:email', function (req, res) {
        //// UPDATE USER'S Password
        User.findOne({ email: req.params.email }).select('email name password resetPasstoken').exec(function (err, user) {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                // Check if the user generally exists with that email
                if (!user) {
                    res.json({ success: false, message: 'Email was not found!' });
                }
                else {
                    // Create a new password
                    newpass = generator.generate({
                        length: 8,
                        numbers: true,
                        symbols: false,
                        uppercase: true
                    });
                    // Assign resetPass token
                    user.resetPassToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                    //user.resettoken = false;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    //Send Mail
                    var mailOptions = {
                        from: '"Predicter: Password Reset " <predicter@info.com>',
                        to: user.email,
                        subject: 'Predicter: Password Reset',
                        text: 'Hello ' + user.name + ', you requested a new password from Predicter. Please click on the following link to activate your new password: http://localhost:2000/activateNewPass/' + user.resetPassToken,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>you requested a new password from Predicter.Your new password is: ' + newpass + '.<br> Please click on the link below to activate your new password:<br><br><a href="http://localhost:2000/activateNewPass/' + user.resetPassToken + '">http://localhost:2000/activateNewPass/</a>'

                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message Sent');
                        };
                    });

                    res.json({ success: true, message: 'Your new Password has been sent to your email.You can change it anytime you want!' });
                }
            }
        });

    });

    // Update this part so that you dont call DB 2 times
    router.get('/activatePass/:token', function (req, res) {
        User.findOne({ resetPassToken: req.params.token }).select('password').exec(function (err, user) {
            if (err) {
                throw err;
            }
            var token = req.params.token;
            // verify token
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Password Link has expired.' });
                } else {
                    // Update new password and change it
                    user.password = newpass;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    ///////////////////////////////
                    res.json({ success: true, message: 'Your new Password has been activated successfully.' });
                }
            });

        });
    });

    // Add all CARS to DB. NOTE!!! CALL IT ONCE FROM POSTMAN Because It is Static
    router.post('/createCarsDB', function (req, res) {
        // Parse JSON and create Car Object
        var carsJSONFile = JSON.parse(carsData);
        var car;
        // Iterate over JSON and add each car to DB
        carsJSONFile.forEach(element => {
            car = new Car();
            car.Name = element.Name;
            car.MPG = element.Miles_per_Gallon;
            car.cylinders = element.Cylinders;
            car.displacement = element.Displacement;
            car.horsepower = element.Horsepower;
            car.weight = element.Weight_in_lbs;
            car.acceleration = element.Acceleration;
            car.year = element.Year; carsJSONFile = JSON.parse(carsData); carsJSONFile = JSON.parse(carsData);
            car.origin = element.Origin;
            car.save(function (err) {
                if (err) {
                    console.log(err);
                }
            }); 
        });
        res.send("Cars added to DB.");
    });

    // Process the answer and give the result
    router.post('/formResult/',function(req,res){
        // Arrange the MPG
        var maxMPG;
        var minMPG;
        if(req.body.MPG == "VeryImportant"){
            maxMPG = 100000;
            minMPG = 31;
        }else if(req.body.MPG == "Important"){
            maxMPG = 31;
            minMPG = 15;
        }else if(req.body.MPG == "LessImportant"){
            maxMPG = 15;
            minMPG = 0;
        }
        // Arrange the HorsePower
        var maxHorsepower;
        var minHorsepower;
        if(req.body.Horsepower == "HighPP"){
            maxHorsepower = 500000;
            minHorsepower = 150;
        }else if(req.body.Horsepower == "MediumPPFuel"){
            maxHorsepower = 150;
            minHorsepower = 76;
        }else if(req.body.Horsepower == "LowPPHighFuel"){
            maxHorsepower = 76;
            minHorsepower = 0;
        }

        ///////////////////////////////////////////
        var query = { origin :  req.body.Origin, cylinders: req.body.Cylinders, horsepower:{ $lt: maxHorsepower, $gt: minHorsepower}, MPG:{ $gt: minMPG,$lt: maxMPG }};
        Car.find(query).exec(function(err, result) {
            if (err) throw err;
            res.send(result);
        });
        
    });

    // Redirect to AUTH
    router.get("/googleAuth", function (req, res) {
        res.send(url);
    });

    // GET GOOGLE TOKEN
    router.get("/googleToken", function (req, res) {

        // Function to retrieve forms after AUTH
        function listFiles(auth) {
            return new Promise(function (resolve, reject) {
                const drive = google.drive({
                    version: 'v3',
                    auth
                });
                drive.files.list({
                    q: "mimeType='application/vnd.google-apps.spreadsheet'",
                    fields: 'nextPageToken, files(id, name)',
                }, (err, res) => {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        return reject(err);
                    }
                    var files = res.data.files;listFiles(oauth2Client)
                    listFiles(oauth2Client)
                    if (files.length) {
                        return resolve(files);
                    } else {
                        console.log('No files found.');
                        return reject({ message: 'No files found.' });
                    }
                });
            });
        }

        var code = req.query.code;

        oauth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log(err);
                return res.send(err);
            } else {
                oauth2Client.setCredentials(tokens);
                listFiles(oauth2Client)
                    .then(function (files) {
                        res.send(files);
                    })
                    .catch(function (err) {
                        console.log(err);
                        res.send(err);
                    });
            }
        });
    });

    // This will give us the Sheet that we desire by ID
    router.get("/getSheetByID", function (req, res) {
        // ID od the desired sheet
        var sheetID = req.query.ID;
        var auth = oauth2Client;

        function getSheetData() {
            return new Promise(function (resolve, reject) {
                const sheets = google.sheets({ version: 'v4', auth });
                sheets.spreadsheets.values.get({
                    spreadsheetId: sheetID,
                    range: '!A1:XX',
                }, (err, res) => {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        return reject(err);
                    }
                    var rows = res.data.values;

                    if (rows.length) {
                        return resolve(rows);
                    } else {
                        console.log('No files found.');
                        return reject({ message: 'No files found.' });
                    }
                });
            });
        }

        // Replace particular String position
        String.prototype.replaceAt = function (index, replacement) {
            return this.substr(0, index) + replacement + this.substr(index + replacement.length);
        }

        getSheetData()
            .then(function (rows) {

                //Check If Collection exists, if true delete former
                mongoose.connection.db.listCollections({ name: 'Answer' })
                    .next(function (err, callinfo) {
                        if (callinfo) {
                            // The collection exists
                            mongoose.connection.db.dropCollection('Answer', function (err, result) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });

                // Here continue adding data to DB
                var answerSchema = new mongoose.Schema({}, { strict: false });
                delete mongoose.connection.models["Answer"];
                var Answer = mongoose.model("Answer", answerSchema, "Answer");
                var questions = rows[0];
                // Iterate over data and add each answer to DB with dynamic schema(This part seems problematic) 
                for (i = 1; i < rows.length; i++) {
                    var answer = {};
                    for (j = 1; j < questions.length; j++) {
                        // Check if question is multiple choice/checkbox
                        if (questions[j].charAt(questions[j].length - 1) == "]") {
                            var n = questions[j].lastIndexOf(" ");
                            var result = questions[j].replaceAt(n, ":");
                            // Remove block parantheseis here
                            result = result.replace('[', '').replace(']', '');
                            var x = result;
                        } else {
                            var x = questions[j];
                        }
                        // Check if the array index exists
                        if ((rows[i][j] !== void 0) && rows[i][j] != "") {
                            // Check If Number or Float then parseFloat
                            if (isNaN(rows[i][j])) {
                                answer[x] = rows[i][j];
                            }
                            else {
                                answer[x] = parseFloat(rows[i][j]);
                            }

                        } else {
                            answer[x] = null;
                        }

                    }
                    answer = new Answer(answer);
                    // Save Answer
                    answer.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });

                }
                
                // Send Check response
                res.send(questions);

            })
            .catch(function (err) {
                console.log(err);
                res.send(err);
            });
    });

    
    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    router.use(function (req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];

        if (token) {
            // verify token
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token Invalid' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' });
        }
    });

    router.post('/currentUser', function (req, res) {
        res.send(req.decoded);
    });


    return router;
}







