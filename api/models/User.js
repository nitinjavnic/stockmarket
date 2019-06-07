const bcrypt = require('bcrypt-nodejs');
module.exports = {

  attributes: {

    email: {
      type: 'string',
      unique: true,
      email:true
    },

    phone: {
      type: 'string',
      required: true,
    },

    isEnabled:{
      type:'boolean',
      defaultsTo:false
    },
    password: {
      type: 'string',
    },

  },

  customToJSON: function () {
    return this.toObject()
  },
};
