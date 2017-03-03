/*
* Helper Utility to send out email using stmp server with username/password credentials
*/

/*
* INCLUDES
*/

var emailJS = require("emailjs/email");
var promise = require('promise');

/*
* MODULE SETTINGS
*/

var settings = {
  gmail: {
    SMTP_HOST: "smtp.gmail.com",
    USE_SSL: true,
    SSL_PORT: 465
  }
};

/*
* PRIVATE FUNCTIONALITY
*/

function sendThroughGmail(gmailUserName, password, toEmail, subject, body){
  return new promise(function(fullfil, reject) {
    //initialize server
    var server = emailJS.server.connect({
      user: gmailUserName,
      password: password,
      host: settings.gmail.SMTP_HOST,
      ssl: settings.gmail.USE_SSL,
      port: settings.gmail.SSL_PORT
    });

    //send message
    server.send({
      text: "",
      from: gmailUserName,
      to: toEmail,
      subject: subject,
      attachment: [{
        data: body,
        alternative: true
      }]
    }, function(err) {
      if (err) reject(err);
      else fullfil({ msg: 'success'});
    });
  });
}

/*
 * PUBLIC FUNCTIONALITY
 */

module.exports.sendThroughGmail = sendThroughGmail;
