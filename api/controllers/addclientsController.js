module.exports = {

  upstoxClient: async function (req, res) {
    try{
      if(req.body){

          let feeds = await Feeds.find();


        feeds.forEach(async function (data,index) {
           let feedId = data.id;

            let name = req.body.name;
            let clientType = req.body.clientType;
            let userId = req.body.uid;
            let password = req.body.password;
            let year = req.body.year;
            let apiKey = req.body.akey;
            let serialKey = req.body.skey;
            if (apiKey=== '') {
                req.addFlash('success', 'Please Enter APIkey!');
                return res.redirect('/addClient');
            }
            if (serialKey === '') {
                req.addFlash('success', 'Please Enter ScreatKey!');
                return res.redirect('/addClient');
            }
            let createdClients = await Client.create({
                name: name,
                clientType: clientType,
                userId: userId,
                password: password,
                year: year,
                apiKey: apiKey,
                serialKey: serialKey,
                feedId: feedId,
            });

            req.addFlash('success', 'Client Added Successfully.');
            return res.redirect('/clientDetail');

        });


      }

    }catch (e) {
      return res.serverError(e);
    }

  },


  clientDetails:async function(req,res){
  try{
    let clients = await Client.find();

    let feeds = await Feeds.find();
    if(clients){
      res.view('clientDetails', {
        clients: clients,
          feeds: feeds,
        layout: true,
      });
    }
  }catch(e){
    return res.serverError(e);
  }
  },


  getFeed:async function(req,res){
    try{
      let clients = await Client.find();
      if(clients){
        res.view('getFeed', {
          clients: clients,
          layout: true,
        });
      }
    }catch(e){
      return res.serverError(e);
    }
  },



  selectClients:async function(req,res){
    try{
        let clientid = req.param('clientid');
        if(clientid){
          let clients = await Client.find({userId:clientid});
          if(clients){
            res.json({"success":true,clients:clients});
          }else{
            res.json({"success":false,Error:'200'});
          }
        }
    }catch (e) {
      return res.serverError(e);

    }
  },

  deleteClients:async function(req,res){
    try{
      let clientid = req.param('clientid');
      if(clientid){
        let clients = await Client.destroy({userId:clientid});
        if(clients){
          res.json({"success":true,clients:clients});
        }else{
          res.json({"success":false,Error:'200'});
        }
      }
    }catch (e) {
      return res.serverError(e);

    }
  },

  deleteSubscribe:async function(req,res) {
    try {
      let subscribeId = req.param('id');
      console.log('**************', subscribeId);
      if (subscribeId) {
        let subscribe = await Feedsubscribe.destroy({id: subscribeId});
        if (subscribe) {
          res.json({"success": true, subscribe: subscribe});
        } else {
          res.json({"success": false, Error: '200'});
        }
      }
    } catch (e) {
      return res.serverError(e);


    }
  },


  updateClients:async function (req,res){
    try{
      if(req.body){
        let clientId = req.body.clientId;
        let name = req.body.name;
        let password = req.body.password;
        let year = req.body.year;
        let apiKey = req.body.akey;
        let serialKey = req.body.skey;
        if (apiKey=== '') {
          req.addFlash('success', 'Please Enter APIkey!');
          return res.redirect('/addClient');
        }
        if (serialKey === '') {
          req.addFlash('success', 'Please Enter ScreatKey!');
          return res.redirect('/addClient');
        }

        let updatedClients = await Client.update({id:clientId})
          .set({
            name: name,
            password: password,
            year: year,
            apiKey: apiKey,
            serialKey: serialKey,
          });
        req.addFlash('success', 'Client Update Successfully.');
        return res.redirect('/clientDetail');
      }
    }catch (e) {
      return res.serverError(e);
    }

  },

  zerodhaClient: async function (req, res) {
    try{
      if(req.body){
        let name = req.body.name;
        let clientType = req.body.clientType;
        let userId = req.body.uid;
        let password = req.body.password;
        let year = req.body.year;
        let apiKey = req.body.akey;
        let serialKey = req.body.skey;
        if (apiKey=== '') {
          req.addFlash('success', 'Please Enter APIkey!');
          return res.redirect('/addClient');
        }
        if (serialKey === '') {
          req.addFlash('success', 'Please Enter ScreatKey!');
          return res.redirect('/addClient');
        }
        let createdClients = await Client.create({
          name: name,
          clientType: clientType,
          userId: userId,
          password: password,
          year: year,
          apiKey: apiKey,
          serialKey: serialKey,
        });

        req.addFlash('success', 'Client Added Successfully.');
        return res.redirect('/clientDetail');

      }

    }catch (e) {
      return res.serverError(e);
    }

  },



  addSubscribe:async function(req,res){
    try{
      if(req.body){

        let clients

        let exchange = req.body.exchange;
        let Feedsymbool = req.body.Feedsymbool;
        let createdClients = await Feedsubscribe.create({
          exchange: exchange,
          Feedsymbool: Feedsymbool,
        });

        req.addFlash('success', 'Subscribe Add SuccessFully');
        return res.redirect('/subscribe');

      }

    }catch (e) {
      return res.serverError(e);
    }
  },

  subscribeList:async function(req,res){
    try{
      let Subscribe = await Feedsubscribe.find();
      let Feed = await Feeds.find();
      if(Subscribe){
        res.view('subscribe', {
          Subscribe: Subscribe,
          Feed: Feed,
          layout: true,
        });
      }
    }catch(e){
      return res.serverError(e);
    }
  },

  activeSubscribe:async function(req,res){
    let subscribeId = req.param('subscribeId');
    if(subscribeId===undefined){
      return res.json({"fail":'500'});

    }
    subscribeId.forEach(async function (value,index) {
      let subscribe = await Feedsubscribe.find({id:value});
      subscribe.forEach(async function (value1,index) {
        let subscribeStatus= value1.isSubscribe;
        if(subscribeStatus===true){
          await Feedsubscribe.update({id:value})
            .set({
              isSubscribe:'false'
            });

          return res.json({"success":true});


        }else if(subscribeStatus===false){
          await Feedsubscribe.update({id:value})
            .set({
              isSubscribe:'true'
            });
        }

        return res.json({"success":false});


      });

    });

  },


  selectSubscribe:async function(req,res){
    try{
      let subscribeId = req.param('subscribeId');
      if(subscribeId){
        let subscribe = await Feedsubscribe.find({id:subscribeId});
        if(subscribe){
          res.json({"success":true,subscribe:subscribe});
        }else{
          res.json({"success":false,Error:'200'});
        }
      }
    }catch (e) {
      return res.serverError(e);

    }
  },


  subscribeUpdate:async function (req,res){
    try{
      if(req.body){
        let subscribeId = req.body.subscribeId;
        let Feedsymbool = req.body.Feedsymbool;
        let exchange = req.body.exchange;

        let updateSubcribe = await Feedsubscribe.update({id:subscribeId})
          .set({
            Feedsymbool: Feedsymbool,
            exchange: exchange,
          });

        req.addFlash('success', 'Subscribe Update Successfully.');
        return res.redirect('/subscribe');

      }
    }catch (e) {
      return res.serverError(e);
    }

  },



  activeFeed:async function(req,res){
    let feedId = req.param('feedId');
    if(feedId===undefined){
      return res.json({"fail":'500'});

    }
    feedId.forEach(async function (value,index) {
      if(value==='UpStox'){
        let UpstoxData = await Feeds.find({upstoxTitle:value});
        UpstoxData.forEach(async function (value1,index) {
            let upStoxFeed = value1.upStoxFeed;
            if(upStoxFeed===true){
              await Feeds.update({upstoxTitle:value})
                .set({
                  upStoxFeed:'false'
                });

              res.json({"success":true,status:'false',upstoxTitle:'upstox'});

            }else if(upStoxFeed===false){
              await Feeds.update({upstoxTitle:value })
                .set({
                  upStoxFeed:'true'
                });

              res.json({"success":false,status:'true',upstoxTitle:'upstox'});

            }
        });

}else if(value==='Zerodha'){
        let zerodhaData = await Feeds.find({zerodhaTitle:value});
        zerodhaData.forEach(async function (value2,index) {
          let zerodhaFeed = value2.zerodhaFeed;
          if (zerodhaFeed === true) {
            await Feeds.update({zerodhaTitle: value})
              .set({
                zerodhaFeed: 'false'
              });

            res.json({"success": true, status:'true', upstoxTitle: 'Zerodha'});

          } else if (zerodhaFeed === false) {
            await Feeds.update({zerodhaTitle: value})
              .set({
                zerodhaFeed: 'true'
              });

            res.json({"success": true, status:'false', upstoxTitle: 'Zerodha'});
          }

        });
      }

    });

  },





};
