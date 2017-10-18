const {mongoose} = require("./../db/mongoose");

var Todo = mongoose.model('Todo', {
	text: {
		type: String,
		required: [true, "No empty todo!"],
		minlength: 3,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	},
	completedAt: {
		type: Number,
		default: null
	},
	_creator: {
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
});


module.exports = {
	Todo
}