/*
* Implementation for all the api endpoints
* Google API Documentation at: http://google.github.io/google-api-nodejs-client/16.1.0/index.html
*/

var google = require('googleapis');
var googleSheets = google.sheets('v4');
var gogleCalendar = google.calendar('v3');
var promise = require('promise');
var emailJS   = require("emailjs/email");


// App Constants
var settings = {
    authKey: {
        type: "service_account",
        project_id: "mwp-website-157805",
        private_key_id: "f0693c7d55dc89cc7d0ed0111ee336f862567199",
        client_email: "456382756111-compute@developer.gserviceaccount.com",
        client_id: "109075384790467502265",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzgDILqtJl6nl5\nb51qblfqkXzni9CdZMx1miVlcDEVzhlolXsSgbJZCyZOHtJS/KhVKXlp4aGL4O8H\nyvJzetfMrYzZ/DWI83vnZYle2CuDmHVN78FwwwY7dbgxntNsJo0XsA/fzMSyUazb\nOZ3oO960C/fqwk1pUgFujQ1a/yU2E7i6N9elEN6NPy/bDRC28ORRbpF+UF6pkD6B\nLlIxwHTUFpJsfghygN8Y669iVk/BwHe839VOyTSdAM6f/m9wUixbrJYqZd2JmAmJ\nXinqhP1uB9ebqrQhyhJ9pBzjCiVqi5kI3ZM6955ay5HurvneClHpSpMdkcc7I26W\nKLgzQT2bAgMBAAECggEATb8+7fLFQsN2bfS8N/cnOUBe22OhriqUrHNhszgO6qTk\nOHpWXkOy3gKIStnqu2sX9hsKraO+9vksTzHGJeKVSd/53AjznyfnCOjfwSbcYhlM\n5b7tCExQjLyGVWe3p2ZjQllN5t+oapwZxLKGBKq54T412YbjRLTyTdHmcP2GPo8+\ne8FRF7k8A4uHezb702otr8UC4vB/iIG1UV6Q76Qw3Pe1lDKBo6vEoEb0xB2C1NoO\nIc1CLxUXEDvf+/9D9ir/WRjPbUqOT+6bVHOx5e2jjsE0YjmiglmaYKdF8fzgqU2y\nNT4Au+JkTy2l7kLVrM7eB4npoiEYdudpGTlJeE/xsQKBgQDbG9JXNzo5NiRbixlf\nXsh1jyS87+WYYNPHLrZ1coemYtU+DkvTzW4dz+ITj545khz0v1IiTmW+IpLkID9+\n3xjsmlpXFL5EuFJk9jBqysH2qoSao68i4bdhUOECkFsD24ZKYzScGQ92rEEgtz8Q\nmgE7BdaPqiwvqV5w/jYgQKT2TwKBgQDRuSpQfsW2IC+ihff+hXeNIkHeuss25gIX\nOp/PxsTuibVSKxQMlTlaBdEyh/iUIrdX9I764EoC3eUxcJ6Zgetny+z2rtNXI9+d\nJvJ0omiOoiMgXfbMicoaubT01KI6jnC46brgWkfSY29SkokSzu8bxdrZqJThQDUA\nL2a+9yk89QKBgF9j+WsnDB4kSCfioyU2Kqejribjel2gqhKpb54qQoxZsuTVbIXF\nhg9MlexWNlhyGFEliiiNYRYqDzFqKLqffkZj3LjUuxFH/fceh2224EL3ccuxP2o8\nQo4HnC51kmpXhFuWXS0oa+cKj0AjBz2/DpIXtJXPTHVjk042HnJkMm1ZAoGANUmj\nIsjTW69Z6yW3GYi4E7g8nGdB8zUGGvjeWmDa8PE0jSg88+WGqQUJXpmF473ecA7H\ntZ7/rzLKZYGECuUj9z+tehB5yo5m5vtaZ6BMiNFRs4ushdQM8jV1cTAF+HLw2Usq\nHI9T6HUzd/ubsJe70Ya4UM2w5nr1/JIOvT73z3ECgYBKAvirvBTnFu6l7kLVRqoU\nmGrrh284Xz2j6dEQ62ZlKzjWYAFP2dvvcw8GRaNJF+/LlXdXj9FglqxXdAW9Z9tq\nn2hNPxhyjrVzLUjKCMkpJSnfIXX1WptT2NoVktb8N7r6r+Y4jWt2ldFukUSYASHG\n0A13Pc0bULpw8GIzXWD4NA==\n-----END PRIVATE KEY-----\n"
    },

    googleApiScopes: {
        CALENDAR_MANAGE: 'https://www.googleapis.com/auth/calendar',
        CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
        SHEETS_MANAGE: 'https://www.googleapis.com/auth/spreadsheets',
        SHEETS_READONLY: 'https://www.googleapis.com/auth/spreadsheets.readonly'
    },

    configSheet : {
        ID: "1RMk1xu0EFccTx2vQNeRuDRbqZVFIjAf5UMar5RHfrxg",
        RANGES: "A2:B100" //skip first row, it is a header row
    },

    contactEmail: {
        to: "maplewoodpreschooledmonds@gmail.com",
        from: "maplewoodpreschooledmonds@gmail.com",
        subject: "Message from preschool website contact page",
        username: "maplewoodpreschooledmonds@gmail.com",
        password: "Maplewood$123",
        smtpHost: "smtp.gmail.com",
        useSSL : true,
        sslPort: 465
    }
};

function getSiteSettings(){
    return new promise(function(fullfil, reject) {
        jwtAuthorize([settings.googleApiScopes.SHEETS_READONLY]).done(function(authtoken) {
            var request = {
                spreadsheetId: settings.configSheet.ID,
                ranges: settings.configSheet.RANGES,
                auth: authtoken
            };
            googleSheets.spreadsheets.values.batchGet(request, function(err, response) {
                if (err) reject(err);
                else {
                   var formattedSettings = { settings: []};
                    for(var i=0; i<response.valueRanges[0].values.length;i++){
                        formattedSettings.settings.push({
                           "key": response.valueRanges[0].values[i][0],
                            "value": response.valueRanges[0].values[i][1]
                        });
                    }
                    fullfil(formattedSettings);
                }
            });

        }, reject);
    });
}

function jwtAuthorize(scopes){
    return new promise(function(fullfil, reject) {
        var jwtClient = new google.auth.JWT(
            settings.authKey.client_email,
            null,
            settings.authKey.private_key,
            scopes,
            ""
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) reject('from jwt: ' + err)
            else fullfil(jwtClient);
        });
    });
}

function sendContactEmail(name, email, phoneNum, message){
    return new promise(function(fullfil, reject) {
        //build message body
        var emailBody = "<span>The following information was typed in:</span><br/><br/>";
        emailBody += "<span style='font-weight:bold'>Name:   </span>" + name + "<br/><br/>";
        emailBody += "<span style='font-weight:bold'>Email:   </span>" + email + "<br/><br/>";
        emailBody += "<span style='font-weight:bold'>Phone Number:   </span>" + (phoneNum ? phoneNum : "(Not Provided)") + "<br/><br/>";
        emailBody += "<span style='font-weight:bold'>Message:   </span>" + message + "<br/><br/>";

        //initialize server
        var server = emailJS.server.connect({
            user: settings.contactEmail.username,
            password: settings.contactEmail.password,
            host: settings.contactEmail.smtpHost,
            ssl: settings.contactEmail.useSSL,
            port: settings.contactEmail.sslPort

        });

        //send message
        server.send({
                text: "",
                from: settings.contactEmail.from,
                to: settings.contactEmail.to,
                subject: settings.contactEmail.subject,
                attachment: [{data: emailBody, alternative: true}]
            }, function (err, message) {
                if(err) reject(err);
                else fullfil(message);
            }
        );
    });
}


/*
* PUBLIC METHODS
*/

//method to get application settings
module.exports.getSiteSettings = getSiteSettings;

//method to send contact page email
module.exports.sendContactEmail = sendContactEmail;
