var express = require("express");
var bodyParser = require("body-parser");
const {ObjectID} = require('mongodb');

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

const PORT = process.env.PORT || 8000;

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
		resp.status(404).send("Bad id");
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

app.listen(PORT, () => {
	console.log('server started on port ${PORT}')
})

module.exports = {
	app
}