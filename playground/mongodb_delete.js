const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://127.0.0.1:27017/TodoApp', (err, db) => {
	if (err) {
		console.log(`unable to connect to db: ${err}`);
		return;
	};

	console.log("connected to db server");

	// db.collection('Todos').deleteMany({text: "eat"}).then( (result) => {
	// 	console.log(result);
	// 	db.close();
	// })

	// db.collection('Todos').deleteOne({text: "eat"}).then( (result) => {
	// 	console.log(result);
	// 	db.close();
	// })	



	// db.collection('Todos').findOneAndDelete({completed: false}).then( (result) => {
	// 	console.log(result);
	// 	db.close();
	// })	


	// db.collection('Users').deleteMany({name: "adi"}).then( (result) => {
	// 	console.log(result);
	// })	

	db.collection('Users').findOneAndDelete({_id: new ObjectID('59df1f655d896c2d8367e608')}).then( (result) => {
		console.log(result);
		db.close();
	})	

});