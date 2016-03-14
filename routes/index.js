var express = require('express');
var config = require('../config.json');
var router = express.Router();

console.log(config.api_key);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.jsonp('you got it');
});

router.get('/Timestamp', function(req, res) {

	if(!isValidRequest(req.query.api_key)) {
		sendError(res, "not valid api key.");	
	} else {
		
		res.jsonp({"Timestamp": new Date().getTime()});	
	}
});

router.post('/Transactions', function(req, res) {
	
	var db = req.db;

	console.log('------------->'+req.body.api_key);

	var bodyData = req.body;
	console.log(bodyData);
	
	console.log(bodyData);
	var api_key = bodyData.api_key;
	console.log('api_key:'+api_key);
	var user_id = parseInt(bodyData.user_id);
	console.log('user_id:'+user_id);
	var product_id = parseInt(bodyData.product_id);
	console.log('product_id:'+product_id);
	var amount = parseInt(bodyData.amount);
	console.log('amount:'+amount);

	if(!isValidRequest(api_key)) {
		sendError(res, "not valid api key.");	
	} else {
		getMaxTransactionId(db, function(id) {
			
			id = parseInt(id) + 1;
			console.log('current transaction id:'+id);
			saveTransaction(db, {"transaction_id": id, "user_id": user_id, "amount": amount, "product_id": product_id},
				function(doc) {
					console.log(doc);
					res.jsonp({"Success": true, "message": "Transaction "+doc.transaction_id+" saved successfully."});
				 
				},
				function(err) {
					sendError(res, err);	
				}
			);
			
		});//getNextSequence(db, 'transaction_id');
		//var id = getNextSequence(db, 'transaction_id');
	}
					
											
});

router.get('/Transactions', function(req, res) {
	
	var db = req.db;
	console.log(req.query);
	try {
		var api_key = req.query.api_key;
		var id = parseInt(req.query.transaction_id);
	} catch(err) {
		console.log(err);
		sendError(res, err);	
	}

	if(!isValidRequest(api_key)) {
		sendError(res, "not valid api key.");	
	} else {
		getTransaction(db, id, 
			function(doc) {
				console.log(doc);
				if(!doc) {
					sendError(res, 'no record found.');	
				} else {
					res.jsonp({"product_id": doc.product_id, "user_id": doc.user_id, "amount": doc.amount});
				}
			},
			function(err) {
				
				sendError(res, err);
			});	
	}
});

router.get('/User/:user_id/Transactions', function(req, res) {
	
	try {
		var user_id = parseInt(req.params.user_id);
		var api_key = req.query.api_key;
		var db = req.db;

		if(!isValidRequest(api_key)) {
			sendError(res, "invalid api key.");	
		} else {
			getTransactionByUser(db, user_id, function(doc) {
				res.jsonp(doc);

			}, function(err) {
				
				sendError(res, err);
			});	
		}
	} catch(err) {
		sendError(res, err.message);	
	}
	console.log(user_id+'......'+api_key);
});

function isValidRequest(key) {
	return key === config.api_key;	
}

function sendError(res, msg) {
	res.jsonp({"error": true, "message": msg});	
}

function getMaxTransactionId(db, func) {
	var collection = db.get('transaction');
	var options = { "sort": [['transaction_id','desc']] };
	collection.findOne({}, options, function(err, doc) {
		console.log('max======='+JSON.stringify(doc));
		func(doc.transaction_id);
		
	});

}

function getNextSequence(db, name) {
	var counters = db.get('counters');
   var ret = counters.findAndModify(
          {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}

function saveTransaction(db, data, success, fail) {
	
	var trans = db.get('transaction');
	trans.insert(data, function(err, doc) {
		
		if(err) {
			fail(err.message);	
		} else {
			success(doc);	
		}
	});
}

function getTransaction(db, id, success, fail) {
	
	try {
	var trans = db.get('transaction');
	
	trans.findOne({"transaction_id": id}, function(err, doc) {
		
		if(err) {
			fail(err.message);	
		} else {
			success(doc);	
		}
	});
	} catch(err) {
		console.log(err);	
	}
}

function getTransactionByUser(db, id, success, fail) {
	
	var trans = db.get('transaction');
	trans.find({"user_id": id}, function(err, doc) {
		if(err) {
			fail(err.message);	
		} else {
			success(doc);	
		}
	});
}



module.exports = router;
