require("./config/config");

const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require('mongodb');
const _ = require("lodash");

const {mongoose} = require("./db/mongoose");
const {Todo} = require("./models/todo");
const {User} = require("./models/user");

const {authenticate} = require("./middleware/authenticate");

const PORT = process.env.PORT;

var app = express();

app.use(bodyParser.json());

app.post("/todos", authenticate, (req, resp) => {
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then((doc) => {
		resp.send(doc);
	}, (err) =>{
		resp.status(400).send(`Error creating the todo: ${err}`)
	})
})


app.get("/todos", authenticate, (req, resp) => {
	Todo.find({_creator: req.user._id}).then((todos) => {
		resp.send({todos})
	}, (err) => {
		resp.status(400).send(`Error creating the todo: ${err}`)
	})
})

app.get("/todos/:id", authenticate, (req, resp) => {
	if (!ObjectID.isValid(req.params.id))
	{
		resp.status(400).send("Bad id");
		return;
	}
	Todo.findOne({_id:req.params.id, _creator:req.user._id}).then((todo) => {
		if (!todo){
			resp.status(404).send(`Could not find Todo with id ${req.params.id}`)	
			return;
		}
		resp.send({todo})
	}, (err) => {
		console.log(err);
		resp.status(400).send(`Bad request`)
	})
})


app.delete("/todos/:id", authenticate, (req, resp) => {
	if (!ObjectID.isValid(req.params.id))
	{
		resp.status(400).send("Bad id");
		return;
	}
	Todo.findOneAndRemove({_id:req.params.id, _creator: req.user._id}).then( (todo) => {
		if (!todo){
			resp.status(404).send(`Could not find Todo with id ${req.params.id}`)
		}
		else{
			resp.send(`Succesfully removed ${todo._id}`);
		}
	}, (err) => {
		resp.status(400).send("Bad request")
	})
})

app.patch("/todos/:id", authenticate, (req, resp) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed'])

	if (!ObjectID.isValid(id))
	{
		resp.status(404).send("Bad id");
		return;
	}

	if (typeof(body.completed) !== 'undefined' || typeof(body.text) !=="undefined"){
		var query = {};
		if (body.completed && _.isBoolean(body.completed)){
			query.completed = true;
			query.completedAt = new Date().getTime();
		} else if (!body.completed && _.isBoolean(body.completed)) {
			query.completed = false;
			query.completedAt = null;
		}
		if (body.text){
			query.text = body.text
		}

		Todo.findOneAndUpdate({_id:req.params.id, _creator: req.user._id}, {$set: query}, {new: true} ).then((todo) => {
			if(!todo){
				resp.status(404).send("Not Found");
				return;
			}
			resp.send({todo});
		}, (err) => {
				resp.status(400).send("Problem")
		})
	}
	else{
		resp.status(200).send();
	}

})

// -----------------> USERS

app.post("/users", (req, resp) => {
	var data = _.pick(req.body, ['email', 'password']);
	var user = new User(data);


	user.save().then((user)=>{
		return user.generateAuthToken();
	}).then((token)=>{
		resp.header('x-auth', token).send({user});
	}).catch((err)=>{

    	if (err.code && err.code === 11000){
			resp.status(400).send("User already exists.")
		}else if (err.errors.email){
			resp.status(400).send(err.errors.email.message)
		}else if (err.errors.password){
			resp.status(400).send(err.errors.password.message)
		}else{
			resp.status(400).send(err)
		}
	})
})

// app.post("/users/login", (req, resp) => {
// 	var data = _.pick(req.body, ['email', 'password']);
// 	User.findOne({email:data.email}).then((user)=>{
// 		return user.checkPass(data.password)
// 	}).then((user) => {
// 		if (user){
// 			return user.generateAuthToken();
// 		}else{
// 			return Promise.reject("bad credentials")
// 		}
// 	}).then((token) => {
// 		console.log(2);
// 		resp.header('x-auth', token).send();
// 	}).catch((err) => {
// 		console.log(err);
// 		resp.status(400).send(err);
// 	})
// })

app.post("/users/login", (req, resp) => {
	var data = _.pick(req.body, ['email', 'password']);
	User.findUserByCredentials(data.email, data.password).then((user) => {
		if (!user){
			return Promise.reject("Bad credentials")
		}
		user.generateAuthToken().then((token)=>{
			resp.header('x-auth', token).send();
		})
	}).catch((err) => {
		resp.status(400).send(err)
	})
})


app.delete('/users/me/token', authenticate, (req, resp) => {
	req.user.logout(req.token).then(()=>{
		resp.status(200).send("logged out");
	}, (err)=>{
		resp.status(400).send()
	})
})

app.get('/users/me', authenticate, (req, resp) => {
	resp.send(req.user);
})


app.listen(PORT, () => {
	console.log(`server started on port ${PORT}`)
})

module.exports = {
	app
}