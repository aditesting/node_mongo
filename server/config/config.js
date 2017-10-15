const ENV = process.env.NODE_ENV || 'development';
if (ENV === 'development'){
	process.env.PORT = 8000;
	process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/TodoApp"
}else if (ENV === 'test'){
	process.env.PORT = 8000;
	process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/TodoAppTest"
}