var passport = require('passport');
var sweetalert = require('sweetalert');

module.exports = {

  process: async function(req, res){
    let email = req.param('email');
    console.log('*****************',email);
    let user = await User.findOne({email: email});

    EmailService.sendEmail(user, 'accountActivation');
    req.addFlash('message', 'Signup successfully. Please check your email..');
    return res.redirect('/');
  },

  activateAccount: async function (req, res) {
    let tokenId = req.params.tokenId;
    let user = await User.findOne({password: tokenId})
    if (user) {
      user.password = "";
      user.isEnabled = true;
      user.save();
      req.addFlash('message', "Your account is verified successfully. Please login.")
    } else {
      req.addFlash('errorMsg', "You have already verified your account. Please try login Portal")
    }
    res.redirect('/')
  },



};
