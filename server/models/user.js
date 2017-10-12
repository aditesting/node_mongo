var mongoose = require("mongoose");

var User = mongoose.model('User', {
	email: {
		type: String,
		required: [true, "email required"],
		minlength: 3,
		trim: true
	},
})

module.exports = {
	User
}