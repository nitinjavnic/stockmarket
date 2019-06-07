module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    userId:{
      type:'string',
      unique:true
    },
    password:{
      type:'string'
    },
    year:{
      type:'string'
    },
    apiKey:{
      type:'string'
    },
    serialKey:{
      type:'string'
    },
    accessToken:{
      type:'string'
    },

    loginCode:{
      type:'string'
    },
    isLogin:{
      type:'boolean',
      defaultsTo:false
    },

      GetFeed:{
          type:'boolean',
          defaultsTo:false
      },

    clientType:{
      type:'string',
    },

      feedId:{
          type:'string'
      }
  }

};
