var express = require("express");
var bodyParser = require("body-parser");

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

app.listen(PORT, () => {
	console.log('server started on port ${PORT}')
})