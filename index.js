const express = require('express');
const bps = require('body-parser');
const httpMsgs = require('http-msgs');
const ejs = require('ejs');
const {
	query
} = require('express');
const sqlite3 = require('sqlite3').verbose();


const app = express();
let db = new sqlite3.Database(__dirname + '/database/database.db', (err) => {
	if (err) return console.error(err.message);
	console.log('connected to database successfully!');
});




app.set('view engine', 'ejs');

app.use(
	bps.urlencoded({
		extended: true
	})
);

app.set('view engine', 'ejs');

app.use('/', express.static('public'));
app.use('/home', express.static('public'));

app.get('/', function (req, res) {
	res.sendFile('home.html', {
		root: __dirname
	});
});



app.get('/home', function (req, res) {


});


app.listen(3000, function () {
	console.log('Listening at port 3000.');
});





app.post('/ajaxdepartment', function (req, res) {

	let query = 'select * from department;';

	db.all(query, function (err, rows) {
		data = [
			['Department ID', 'Department Name', 'Number of People']
		];
		if (err) {
			console.log(err.message);
		} else rows.forEach((row) => {
			data.push([row.id, row.name, row.count]);
		});
		res.render('table', {
			data: data
		});
	});

});


app.post('/ajaxuser', function (req, res) {

	let query = 'select (select name from department where id=user.department_id)as dept_name, user.id as id, user.name as name from user;';
	db.all(query, function (err, rows) {
		data = [
			['Department Name', 'User ID', 'Name']
		];
		if (err) {
			console.log(err.message);
		} else rows.forEach((row) => {
			data.push([row.dept_name, row.id, row.name]);
		});
		res.render('table', {
			data: data
		});
	});

});