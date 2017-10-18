const expect = require('expect');
const request = require('supertest');

const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {initialTodos, populateTodos, initialUsers, populateUsers} = require('./seed/seed');



beforeEach(populateUsers);
beforeEach(populateTodos);


describe("POST /todos", () => {
	it("should create a new todo", (done) => {
		var text = "testing a new note";

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((resp) => {
				expect(resp.body.text).toBe(text);
			})
			.end((err, resp) => {
				if (err){
					done(err);
					return;
				}
				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch( (err) => done(err) )
			})
	})

	it("should not create Todo", (done) => {
		request(app)
			.post("/todos")
			.send({})
			.expect(400)
			.end((err, resp) => {
				if(err){
					done(err);
					return;
				}

				Todo.count({}).then((count) => {
					expect(count).toBe(initialTodos.length);
					done();
				}).catch((err) => done(err))
			})
	})
})

describe("GET /todos", () => {
	it('should get all todos', (done) => {
		request(app)
			.get("/todos")
			.expect(200)
			.expect((resp) => {
				expect(resp.body.todos.length).toBe(initialTodos.length);
			})
			.end(done);
	})
})

describe("GET /todos/:id", () => {
	it('should get a specific todo', (done) => {
		request(app)
			.get(`/todos/${initialTodos[0]._id.toHexString()}`)
			.expect(200)
			.expect((resp) => {
				expect(resp.body.todo).toExist();
				expect(resp.body.todo.text).toBe(initialTodos[0].text);
			})
			.end(done);
	})

	it("should fail to get a correct id", (done) => {
		request(app)
			.get(`/todos/${new ObjectID()}`)
			.expect(404)
			.end(done);
	})


	it("should fail to get a bad id", (done) => {
		request(app)
			.get(`/todos/123123122`)
			.expect(400)
			.end(done);
	})
})

describe("DELETE /todos/:id", () => {
	it("should delete a specific todo", (done) =>{
		request(app)
			.delete(`/todos/${initialTodos[0]._id.toHexString()}`)
			.expect(200)
			.end((err, resp) => {
				if(err){
					done(err);
					return;
				};
				Todo.findById(initialTodos[0]._id.toHexString()).then( (todo) => {
					expect(todo).toNotExist();
					done();
				}, (err)=> done(err))
			})
	})

	it("should retunr 404 for wrong id", (done)=>{
		request(app)
			.delete(`/todos/${new ObjectID()}`)
			.expect(404)
			.end(done);
	})

	it("should return 404 for bad id", (done)=>{
		request(app)
			.delete("/todos/123123")
			.expect(400)
			.end(done)
	})
})


describe("PATCH /todos/:id", () => {
	it("should update a specific todo text and status", (done) =>{
		request(app)
			.patch(`/todos/${initialTodos[0]._id.toHexString()}`)
			.send({"text": "updated text", "completed": true})
			.expect(200)
			.end((err, resp) => {
				if(err){
					done(err);
					return;
				};
				Todo.findById(initialTodos[0]._id.toHexString()).then( (todo) => {
					expect(todo.completed).toBe(true);
					expect(todo.completedAt).toBeA("number");
					expect(todo.text).toBe("updated text");
					done();
				}, (err)=> done(err))
			})
	})

	it("should update a specific todo text", (done) =>{
		request(app)
			.patch(`/todos/${initialTodos[0]._id.toHexString()}`)
			.send({"text": "updated text"})
			.expect(200)
			.end((err, resp) => {
				if(err){
					done(err);
					return;
				};
				Todo.findById(initialTodos[0]._id.toHexString()).then( (todo) => {
					expect(todo.completed).toBe(false);
					expect(todo.completedAt).toBe(null);
					expect(todo.text).toBe("updated text");
					done();
				}, (err)=> done(err))
			})
	})


	it("should update a specific todo status", (done) =>{
		request(app)
			.patch(`/todos/${initialTodos[0]._id.toHexString()}`)
			.send({"completed": true})
			.expect(200)
			.end((err, resp) => {
				if(err){
					done(err);
					return;
				};
				Todo.findById(initialTodos[0]._id.toHexString()).then( (todo) => {
					expect(todo.completed).toBe(true);
					expect(todo.completedAt).toExist();
					done();
				}, (err)=> done(err))
			})
	})

	it("should return 200 for wrong id", (done)=>{
		request(app)
			.patch(`/todos/${new ObjectID()}`)
			.send({"text": "updated text", "completed": true})
			.expect(200)
			.end(done);
	})

	it("should return 404 for bad id", (done)=>{
		request(app)
			.patch("/todos/123123")
			.send({"text": "updated text", "completed": true})
			.expect(400)
			.end(done)
	})
})


describe("GET /users/me", () => {
	it("should return user if authenticated", (done) => {
		request(app)
			.get("/users/me")
			.set('x-auth', initialUsers[0].tokens[0].token)
			.expect(200)
			.expect((resp) => {
				expect(resp.body._id).toBe(initialUsers[0]._id.toHexString());
				expect(resp.body.email).toBe(initialUsers[0].email);
			})
			.end(done);
	});

	it("should return 401 if not authenticated", (done) => {
		request(app)
			.get("/users/me")
			.set('x-auth', 'aaaaaaaaaaaaaaaaaaaaa')
			.expect(401)
			.expect((resp) => {
				expect(resp.body).toEqual({});
			})
			.end(done);
	})
})


describe("POST  /users - login", () => {
	it("should create a user", (done)=> {
		var email = "test123@123.com";
		var password = "aaaaaaa";
		request(app)
			.post("/users")
			.send({
				email,
				password
			})
			.expect(200)
			.expect((resp)=>{
				expect(resp.headers['x-auth']).toExist()
				expect(resp.body.user._id).toExist();
				expect(resp.body.user.email).toBe(email);
			})
			.end((err)=>{
				if (err) {
					return done(err)
				};
				User.findOne({email}).then((user)=>{
					expect(user).toExist();
					expect(user.password).toNotBe(password);
					done()
				})
			});
	});

	it("should return validation error for invalid data", (done)=> {
		var email = "test123";
		var password = "aaaaaaa";
		request(app)
			.post("/users")
			.send({
				email,
				password
			})
			.expect(400)
			.expect((resp)=>{
				expect(resp.headers['x-auth']).toNotExist()
				expect(resp.body.user).toNotExist();
			})
			.end(done);
	});

	it("should not create user if email in use", (done)=> {
		var email = initialUsers[0].email;
		var password = "aaaaaaa";
		request(app)
			.post("/users")
			.send({
				email,
				password
			})
			.expect(400)
			.expect((resp)=>{
				expect(resp.headers['x-auth']).toNotExist()
				expect(resp.body.user).toNotExist();
			})
			.end(done);
	});
})