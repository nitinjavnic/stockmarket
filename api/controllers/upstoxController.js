const Upstox = require("upstox");
const request = require('request');
var opn = require('opn');
var schedule = require('node-schedule');
const moment = require('moment');
const async = require('async');

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

                    let tables;
                    let strickprice;
                    let expire;
                    subscribeFeed.forEach(function (value) {
                        tables = value.tables;
                        strickprice = value.strickprice;
                        expire = value.expire;
                    });
                    upstox.connectSocket()
                        .then(function(){

                            subscribeFeed.forEach(async function (subscibedata,index) {
                                let feedSymbool = subscibedata.Feedsymbool;
                                let exchange = subscibedata.exchange;

                                upstox.subscribeFeed({
                                    "exchange": exchange,
                                    "symbol":feedSymbool,
                                    "type": "full",
                                })
                                    .then(async function (response) {
                                        console.log('***',response);
                                    })
                                    .catch(function (error) {
                                        console.log('Error in subscribe feed ', error);
                                    });
                            });

                            upstox.on("liveFeed", async function (livedata) {
                                livedata.forEach(async function (value,index1) {

                                    if(tables==='index'){
                                       await index_tables.create({ltp:value.ltp,timestamp:value.timestamp,symbool:value.symbol,yearlylow:value.yearly_low,yearlyhigh:value.yearly_high});
                                       let ltp = await index_tables.find({select: ['ltp','symbool']}).sort('createdAt DESC').limit(60);
                                       let open = ltp[0].ltp;
                                       let close = ltp.slice(-1).pop();
                                       let newclose = close.ltp;
                                       let heigh = Math.max(...ltp.map(s => s.ltp));
                                       let low = Math.min(...ltp.map(s => s.ltp));
                                       let yearlyhigh=ltp.yearlyhigh;
                                       let yearlylow=ltp.yearlylow;
                                       let symbool=ltp[0].symbool;
                                       await Minuteindex.create({open:open,high:heigh,low:low,close:newclose,yearlyhigh:yearlyhigh,yearlylow:yearlylow,strickprice:strickprice,symbool:symbool});

                                   }

                                   if(tables==='future'){
                                       await Future.create({liveLtp:value.ltp,timestamp:value.timestamp});
                                       let ltp = await Future.find({select: ['ltp']}).sort('createdAt DESC').limit(60);
                                       let open = ltp[0].ltp;
                                       let close = ltp.slice(-1).pop();
                                       let newclose = close.ltp;
                                       let heigh = Math.max(...ltp.map(s => s.ltp));
                                       let low = Math.min(...ltp.map(s => s.ltp));
                                       await MinuteFuture.create({open:open,high:heigh,low:low,close:newclose});
                                   }

                                   if(tables==='stock'){
                                       await Stock.create({liveLtp:value.ltp,timestamp:value.timestamp});
                                       let ltp = await Stock.find({select: ['ltp']}).sort('createdAt DESC').limit(60);
                                       let open = ltp[0].ltp;
                                       let close = ltp.slice(-1).pop();
                                       let newclose = close.ltp;
                                       let heigh = Math.max(...ltp.map(s => s.ltp));
                                       let low = Math.min(...ltp.map(s => s.ltp));
                                       await MinuteStock.create({open:open,high:heigh,low:low,close:newclose});

                                   }

                                   if(tables==='option'){

                                       Options.create({
                                           ltp:value.ltp,
                                           timestamp:value.timestamp,
                                           volume:value.vtt,
                                           symbool:value.symbol,
                                           strikeprice:strickprice,
                                           oi:value.oi,
                                           bidqty:value.bids[0].quantity,
                                           bidprice:value.bids[0].price,
                                           askqty:value.asks[0].quantity,
                                           askprice:value.asks[0].price

                                       }).exec(function (err, result){
                                           if (err) {
                                               return res.serverError(err);
                                           }


                                       });

                                   }


                                });


                            });


                            Options.query('SELECT createdAt FROM options ORDER BY createdAt DESC',function(err, dataResult) {
                                if (err) {
                                    return res.serverError(err);
                                }

                                /*let date_format;
                                let date_format2;
                                dataResult.forEach(async function (value,index) {
                                    let timeStamp =  value.createdAt;
                                    var d1 = timeStamp,
                                        d2 = new Date ( d1 );
                                    d2.setMinutes (timeStamp.getMinutes() + 1 );
                                    var newdate = moment(timeStamp);
                                    var newdate2 = moment(d2);
                                    date_format = newdate.format("YYYY-MM-DD HH:mm:ss ");
                                    date_format2 = newdate2.format("YYYY-MM-DD HH:mm:ss ");

                                });*/

                                async.eachOfSeries(dataResult,function (createdAt,index,next) {
                                    console.log(createdAt);

                                        let timeStamp =  createdAt.createdAt;
                                        var d1 = timeStamp,
                                        d2 = new Date ( d1 );
                                        d2.setMinutes (timeStamp.getMinutes() + 1 );
                                        var newdate = moment(timeStamp);
                                        var newdate2 = moment(d2);
                                        var date_format = newdate.format("YYYY-MM-DD HH:mm:ss ");
                                        var date_format2 = newdate2.format("YYYY-MM-DD HH:mm:ss ");


                                        let test1 = `SELECT * FROM options WHERE createdAt BETWEEN '${date_format}' AND '${date_format2}' ORDER BY createdAt DESC`;
                                        console.log('>>>>>>>nitin',test1);
                                        Options.query(test1,  function(err, rawResult) {

                                        if(rawResult){
                                            let open = rawResult[0].ltp;
                                            let close = rawResult.slice(-1).pop();
                                            let volume = rawResult.slice(-1).pop();
                                            let oi = rawResult.slice(-1).pop();
                                            let bidqty = rawResult.slice(-1).pop();
                                            let bidprice = rawResult.slice(-1).pop();
                                            let askqty = rawResult.slice(-1).pop();
                                            let askprice = rawResult.slice(-1).pop();
                                            let newclose = close.ltp;
                                            let newvolume = volume.volume;
                                            let newoi = oi.oi;
                                            let newbidqty = bidqty.bidqty;
                                            let newbidprice = bidprice.bidprice;
                                            let newaskqty = askqty.askqty;
                                            let newaskprice = askprice.askprice;
                                            let heigh = Math.max(...rawResult.map(s => s.ltp));
                                            let low = Math.min(...rawResult.map(s => s.ltp));
                                            MinuteOption.create({
                                                symbool:rawResult[0].symbool,
                                                strikeprice:strickprice,
                                                expire:expire,
                                                O:open,
                                                H:heigh,
                                                L:low,
                                                C:newclose,
                                                Sum:newvolume,
                                                OI:newoi,
                                                bid_qty:newbidqty,
                                                bid_price:newbidprice,
                                                askqty:newaskqty,
                                                ask_price:newaskprice,


                                            }).
                                            exec(function (err, finn){
                                                if (err) {
                                                    console.log('errror ',err);
                                                }

                                                return res.ok();
                                            });

                                        }

                                    });

                                });


                               // var test = `SELECT * FROM options WHERE createdAt BETWEEN '${date_format}' AND '${date_format2}' ORDER BY createdAt DESC`;

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

