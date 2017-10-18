const {ObjectID} = require('mongodb');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

// -- user init
const u1ID = new ObjectID();
const u2ID = new ObjectID();

const initialUsers = [{
					_id: u1ID,
					email: 'workingUser@com.com',
					password: 'u1pass',
					tokens:[{
						access: 'auth',
						token: jwt.sign({_id:u1ID, access:'auth'}, 'aaaa').toString()
							}]
					},{
					_id: u2ID,
					email: 'failingUser@com.com',
					password: 'u2pass',
					tokens:[{
						access: 'auth',
						token: jwt.sign({_id:u2ID, access:'auth'}, 'aaaa').toString()
							}]
					}]


// ---- todo init
const initialTodos = [{
	_id : new ObjectID(),
	text: 'First todo',
	_creator: u1ID
},{
	_id : new ObjectID(),
	text: 'Second todo',
	_creator: u1ID
},{
	_id : new ObjectID(),
	text: 'Third todo',
	_creator: u2ID
}]


// ----- todo populate
const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(initialTodos)
	})
	.then((arr) => {
		// initialTodoDocsArray = arr;
		done();
	}).catch((err)=>{
		console.log(`!!!! ${err}`);
	});
}

// ----- user populate
const populateUsers = (done) =>{
	User.remove({}).then(()=>{
		User.create(initialUsers, (err) => {
			if (err) {
				done(err);
			}
			else{
				done();
			}
		})
	});
}


module.exports = {
	initialTodos,
	populateTodos,
	initialUsers,
	populateUsers
}