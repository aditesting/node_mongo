const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
	if (err) {
		console.log(`unable to connect to db: ${err}`);
		return;
	};

	console.log("connected to db server");


	// db.collection('Todos').findOneAndUpdate({
	// 	_id: new ObjectID('59df228761c3a2d80b3f0599')
	// },{
	// 	$set: {completed: true}
	// },{
	// 	returnOriginal: false
	// })
	// .then( (result) => {
	// 	console.log(result);
	// 	db.close();
	// })	

	db.collection("Users").findOneAndUpdate({
		_id: new ObjectID('59df1ea1dde6432bc86f19cc')
	}, {
		$set: {
			name: "adi"
		},
		$inc: {
			age: 1
		}
	},{
		returnOriginal: false
	}).then( (result) => {
		console.log(JSON.stringify(result, undefined, 2));
		db.close()
	})

});