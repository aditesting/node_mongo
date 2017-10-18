const validator = require("validator");
const {mongoose} = require("./../db/mongoose");
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "email required"],
		minlength: 3,
		trim: true,
		unique: true,
		validate: {
			validator: (v) => {
				return validator.isEmail(v);
			},
			message: `{VALUE} is not a valid email`
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token:{
			type: String,
			required: true
		}
	}]
})

UserSchema.methods.generateAuthToken = function() {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'aaaa');

	user.tokens.push({access, token});
	return user.save().then(() => {
		return token;
	})
}

UserSchema.methods.toJSON = function() {
	var user = this;

	var userObject = user.toObject();
	return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.checkPass = function(pass){
	var user = this;

	return bcrypt.compare(pass, user.password).then((result) => {
		if (result){
			return user;
		}
		else{
			return false
		}
	})
}

UserSchema.methods.logout = function(token){
	var user = this;

	return user.update({
		$pull:{
			tokens:{
				token: token
			}
		}
	})
}


UserSchema.statics.findUserByCredentials = function(email, pass){
	var User = this;

	return User.findOne({email}).then((user) => {
		if(!user){
			return Promise.reject("Bad credentials");
		}

		return bcrypt.compare(pass, user.password).then((result) => {
			if (result){
				return user;
			}
			else{
				return false
			}
		})

	})
}

UserSchema.statics.findByToken = function(token) {
	var User = this;

	var decoded ;

	try{
		decoded = jwt.verify(token, 'aaaa');
	} catch (e){
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	})
}

UserSchema.pre('save', function(next){
	var user = this;

	if(user.isModified('password')){
		bcrypt.genSalt(10, (err, salt) => {
			if (err){
				console.log(err);
				next(err);
			}
			bcrypt.hash(user.password, salt, (err, hash)=>{
				user.password = hash;
				next();
			})
		})
	}else{
		next();
	}
});


var User = mongoose.model('User', UserSchema)

module.exports = {
	User
}