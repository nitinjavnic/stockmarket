module.exports= {
  sendEmail: function (user, emailType) {
    sails.log('inside email service : user: ', user);
    sails.log('inside email service : email Type: ', emailType);
    switch (emailType) {

      case 'forgetPassword':
        sails.hooks.email.send(
          'forgetPassword',
          {
            name: user.email,
            password: user.password
          },
          {
            to: user.email,
            subject: 'Forgot password'
          },
          function (err) {
            console.log(err || 'Mail Sent!');
          }
        );

        break;
      case 'accountActivation':

        sails.hooks.email.send(
          'accountActivation',
          {
            name: 'Assem Singhal',
            password: user.password
          },
          {
            to: user.email,
            subject: 'Welcome To StockTrader'
          },
          function (err) {
            console.log(err || 'Mail Sent!');
          }
        );
        break;
    }
  }
}
