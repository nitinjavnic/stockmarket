module.exports = {

  dashboard: async function(req,res){
    try {
      let clients = await Client.find({clientType:'Upstox'});
      let Zerodhaclients = await Client.find({clientType:'Zerodha'});
      let Feed = await Feeds.find();
      let subscribe = await Feedsubscribe.find();
      if(clients){
        res.view('dashboard', {
          clients: clients,
            Zerodhaclients: Zerodhaclients,
          Feed: Feed,
          subscribe: subscribe,
          layout: true,
        });
      }
    }catch (e) {
      return res.serverError(e);

    }

  }

};
