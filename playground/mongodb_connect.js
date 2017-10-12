const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
	if (err) {
		console.log(`unable to connect to db: ${err}`);
		return;
	};

	console.log("connected to db server");

	// db.collection('Todos').insertOne({
	// 	text: 'Something to do',
	// 	completed: false,
	// 	_id: "aaaaa"
	// }, (err, result)=> {
	// 	if (err){
	// 		console.log(`problem inserting: ${err}`);
	// 		return;
	// 	}
	// 	console.log(JSON.stringify(result.ops, undefined, 2));
	// })

	// db.collection('Users').insertOne({
	// 	name: "adi",
	// 	age: 31,
	// 	location: "Brasov"
	// }, (err, result) => {
	// 	if(err) {
	// 		console.log(`problem inserting user: ${err}`);
	// 		return;
	// 	}
	// 	console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2))
	// })

	db.close();
});