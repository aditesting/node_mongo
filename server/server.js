require("./config/config");

const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require('mongodb');
const _ = require("lodash");

const {mongoose} = require("./db/mongoose");
const {Todo} = require("./models/todo");
const {User} = require("./models/user");

const PORT = process.env.PORT;

var app = express();

app.use(bodyParser.json());

app.post("/todos", (req, resp) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		resp.send(doc);
	}, (err) =>{
		resp.status(400).send(`Error creating the todo: ${err}`)
	})
})


app.get("/todos", (req, resp) => {
	Todo.find().then((todos) => {
		resp.send({todos})
	}, (err) => {
		resp.status(400).send(`Error creating the todo: ${err}`)
	})
})

app.get("/todos/:id", (req, resp) => {
	if (!ObjectID.isValid(req.params.id))
	{
		resp.status(400).send("Bad id");
		return;
	}
	Todo.findById(req.params.id).then((todo) => {
		if (!todo){
			resp.status(404).send(`Could not find Todo with id ${req.params.id}`)	
			return;
		}
		resp.send({todo})
	}, (err) => {
		resp.status(400).send(`Bad request`)
	})
})


app.delete("/todos/:id", (req, resp) => {
	if (!ObjectID.isValid(req.params.id))
	{
		resp.status(400).send("Bad id");
		return;
	}
	Todo.findByIdAndRemove(req.params.id).then( (todo) => {
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

app.patch("/todos/:id", (req, resp) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed'])

	if (!ObjectID.isValid(id))
	{
		resp.status(400).send("Bad id");
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
		Todo.findByIdAndUpdate(id, {$set: query}, {new: true} ).then((todo) => {
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
			resp.send("User already exists.")
		}else if (err.errors.email){
			resp.status(400).send(err.errors.email.message)
		}else if (err.errors.password){
			resp.status(400).send(err.errors.password.message)
		}else{
			resp.status(400).send(err)
		}
	})
})


app.listen(PORT, () => {
	console.log(`server started on port ${PORT}`)
})

module.exports = {
	app
}