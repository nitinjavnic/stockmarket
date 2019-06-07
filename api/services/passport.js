const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt');

async function findById(id, fn) {
  var id = await User.findOne(id);
  console.log('*******************id',id);
  if(id){
    return fn(null ,id);
  }
}

async function findByUsername(u, fn) {
  try {
    var user = await User.findOne({email: u});
    console.log('*********************',user);
    if(user){
      return fn(null , user);
    }else{
      return fn(null , false);
    }
  }
  catch (e) {
    console.log(e);
  }

}

passport.serializeUser(function (user, done) {
  done(null, user.id);
  console.log('user id for session : ', user.id);
});

passport.deserializeUser(function (id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy(
  function (username, password, done) {

    process.nextTick(function () {
      findByUsername(username, function (err, user) {
        if (err)
          return done(null, err);
        bcrypt.compare(password, user.password, function (err, res) {
          if (!res)
            return done(null, false, {
              message: 'Invalid Password'
            });
          return done(null, user, {
            message: 'Logged In Successfully'
          });
        });
      })
    });
  }
));
