const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
	if (err) {
		console.log(`unable to connect to db: ${err}`);
		return;
	};

	console.log("connected to db server");

	// db.collection('Todos').find({_id: new ObjectID('59df1daf435faf29df09d661')}).toArray().then((docs) => {
	// 	console.log("Todos:");
	// 	console.log(JSON.stringify(docs, undefined, 2));
	// 	db.close()
	// }, (err) => {
	// 	console.log(`unable to fetch todos: ${err}`)
	// 	db.close();
	// })

	// db.collection('Todos').find({_id: new ObjectID('59df1daf435faf29df09d661')}).count().then((count) => {
	// 	console.log(`Todos : ${count}` );
	// 	db.close()
	// }, (err) => {
	// 	console.log(`unable to fetch todos: ${err}`)
	// 	db.close();
	// })



	db.collection('Users').find({name: "adi"}).count().then((count) => {
		console.log(`Users named 'adi': ${count}`);
		db.collection('Users').find({name: "adi"}).toArray().then( (docs) => {
			console.log(JSON.stringify(docs, undefined, 2));
		}, (err) => {
			console.log(`error fetching users: ${err}`)
		})
		db.close()
	}, (err) => {
		console.log(`unable to fetch todos: ${err}`)
		db.close();
	})

	// db.close();
});