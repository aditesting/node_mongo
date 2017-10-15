const expect = require('expect');
const request = require('supertest');

const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const initialTodos = [{
	text: 'First todo'
},{
	text: 'Second todo'
},{
	text: 'Third todo'
}]

var initialTodoDocsArray = null;

beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(initialTodos)
	})
	.then((arr) => {
		initialTodoDocsArray = arr;
		done();
	});
});


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
			.get(`/todos/${initialTodoDocsArray[0]._id.toHexString()}`)
			.expect(200)
			.expect((resp) => {
				expect(resp.body.todo).toExist();
				expect(resp.body.todo.text).toBe(initialTodoDocsArray[0].text);
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
			.delete(`/todos/${initialTodoDocsArray[0]._id.toHexString()}`)
			.expect(200)
			.end((err, resp) => {
				if(err){
					done(err);
					return;
				};
				Todo.findById(initialTodoDocsArray[0]._id.toHexString()).then( (todo) => {
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