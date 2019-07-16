/*
var cron = require('node-cron');
cron.schedule('* * * * *',async function(){
    var ltp = await liveltp.find({select: ['liveLtp']}).sort('createdAt DESC').limit(60);
   ltp.forEach(async function (value,index) {
       console.log('live ltp is ',value.liveLtp);
       await minuteLtp.create({minuteltp:value.liveLtp});

   });

 });
*/
