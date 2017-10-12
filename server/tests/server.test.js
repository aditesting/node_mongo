const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');


beforeEach((done) => {
	Todo.remove({}).then(() => done());
})


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
				Todo.find().then((todos) => {
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
					expect(count).toBe(0);
					done();
				}).catch((err) => done(err))
			})
	})
})