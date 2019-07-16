module.exports = {

    Indexoption: async function(req,res){
        try {
            let subscribe = await Feedsubscribe.find();
            res.view('frontEnd/option_chain', {
                subscribe: subscribe,
                layout: 'layouts/fronLayout'
            });

        }catch (e) {
            return res.serverError(e);

        }

    },

    ohlMinute: async function(req,res){
        try {
            let symbool = req.body.symbool;
            let indexMinute = await MinuteOption.find({symbool:symbool});
            res.view('frontEnd/ohlcMinute', {
                indexMinute: indexMinute,
                layout: false
            });
        }catch (e) {
            return res.serverError(e);
        }
    }

};
