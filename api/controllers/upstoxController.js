const Upstox = require("upstox");
const request = require('request');
var opn = require('opn');
var schedule = require('node-schedule');
const moment = require('moment');

module.exports = {
    upstoxCallback:async function(req ,res){
        let loginCode = req.query.code;
        let activedfeedClient = await Client.find({GetFeed:true});
        activedfeedClient.forEach(async function (getData,index) {
            let apiKey = getData.apiKey;
            let serialKey = getData.serialKey;
            let clientId = getData.id;
            let upstox = new Upstox(apiKey);
            let params = {
                "apiSecret" : serialKey,
                "code" : loginCode,
                "grant_type" : "authorization_code",
                "redirect_uri" : "http://localhost:1337/upstoxCallback"
            };
            let accessToken;
            upstox.getAccessToken(params)
                .then(async function(response) {
                    accessToken = response.access_token;
                    upstox.setToken(accessToken);
                    let subscribeFeed = await Feedsubscribe.find({isSubscribe:true});
                    let subscribeFeedIDs=[];
                    subscribeFeed.forEach(function (value) {
                        subscribeFeedIDs.push(value.id);
                    });

                    upstox.connectSocket()
                            .then(function(){

                                subscribeFeed.forEach(async function (subscibedata,index) {
                                    let feedSymbool = subscibedata.Feedsymbool;
                                    let exchange = subscibedata.exchange;
                                    let subscribeId= subscibedata.id;

                                    upstox.subscribeFeed({
                                        "exchange": exchange,
                                        "symbol":feedSymbool,
                                        "type": "ltp",
                                    })
                                        .then(async function (response) {
                                            console.log('response',response);


                                        })
                                        .catch(function (error) {
                                            console.log('Error in subscribe feed ', error);
                                        });
                                });

                                upstox.on("liveFeed", async function (livedata) {
                                    livedata.forEach(async function (value,index) {
                                        console.log('live ltp is ',value.ltp);

                                         await liveltp.create({exchange:value.exchange,feedSymbool:value.symbol,liveLtp:value.ltp});


                                    });
                                });

                            }).catch(function(err){
                            console.log('Error',err);
                        });



                });

        });

    },



    GetFeed: async function(req,res){
        let userId = req.param('userId');
        let Clients = await Client.findOne({
            userId: userId
        });

        if(Clients.GetFeed===false){
            let apiKey = Clients.apiKey;
            let upstox = new Upstox(apiKey);
            let loginUrl = upstox.getLoginUri("http://localhost:1337/upstoxCallback");
            let updatedClients = await Client.update({ userId:userId })
                .set({
                    GetFeed:true
                });
           //opn(loginUrl);
            return res.json({"success":true,loginUrl:loginUrl});
        }else if(Clients.GetFeed===true){
            let updatedClients = await Client.update({ userId:userId })
                .set({
                    GetFeed:false
                });
        }
        return res.json({"success":false});

    },




    clientsActive:async function(req,res){
        let userId = req.param('userId');
        if(userId===undefined){
            return res.badRequest(
                'Please try again with an check any clients'
            );
        }
        userId.forEach(async function (value,index) {
            let Clients = await Client.findOne({
                userId: value
            });
            let checkLogin = Clients.isLogin;

            if(checkLogin===false){
                await Client.update({ userId:value })
                    .set({
                        isLogin:true
                    });

                let apiKey = Clients.apiKey;
                let upstox = new Upstox(apiKey);
                let loginUrl = upstox.getLoginUri("http://localhost:1337/upstoxCallback");
                let updatedClients = await Client.update({ userId:value })
                    .set({
                        isLogin:true
                    });

                opn(loginUrl);

                return res.json({"success":true});

            }else if(checkLogin===true){
                await Client.update({ userId:value })
                    .set({
                        isLogin:false
                    });
                return res.json({"success":false});

            }


        });

    },

    checkLogin:async function(req,res){
        try {
            let clientsid = req.param('clientsid');
            if(clientsid===undefined){
                return res.json({"fail":'500'});
            }
            clientsid.forEach(async function (value,index) {
                let clients = await Client.find({userId:value});
                clients.forEach(async function (client,index) {
                    let checkLogin = client.isLogin;
                    if(checkLogin===false){
                        await Client.update({ userId:value })
                            .set({
                                isLogin:true
                            });

                        return res.json({"success":true});

                    }else if(checkLogin===true){
                        await Client.update({ userId:value })
                            .set({
                                isLogin:false
                            });
                    }
                });

                return res.json({"success":false});


            });
        }catch (err) {
            console.log('Error',err);
        }

    },



    getOhlc:async function(req,res){
        let feedSymbol = req.query.feed;
        let ohlc = await liveltp.find({
            where: {feedSymbool:feedSymbol},
            select: ['liveLtp']
        })
        .limit(60);
        let ltp=[];
        ohlc.forEach(function (liveltp) {
            ltp.push(liveltp.liveLtp)
        });
        let minresult = ltp[0];
        ltp.forEach(function(x) {
            if (parseFloat(x) < minresult) minresult = x; // find smallest number as string instead
        });

        let maxresult = ltp[0];

        ltp.forEach(function(x) {
            if (parseFloat(x) > maxresult) maxresult = x; // find smallest number as string instead
        });

      let maximumNumber = maxresult;
      let minmumNumber = minresult;
      let opevalue = ltp[0];
      let closevalue = ltp[ltp.length - 1];
        res.view('getOhlc', {
            o: opevalue,
            h: maximumNumber,
            l: minmumNumber,
            c: closevalue,
            feedSymbol:feedSymbol,
            layout: true,
        });

    }


};

