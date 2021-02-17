const express = require('express');
const bps = require('body-parser');
const app = express();

app.set('view engine', 'ejs');

app.use(
	bps.urlencoded({
		extended: true
	})
);


app.use('/', express.static('public'));
app.use('/home', express.static('public'));

app.get('/', function(req, res) {
	res.sendFile('home.html',{root: __dirname });
});



app.get('/home', function(req, res) {
	
		
});


app.listen(3000, function() {
	console.log('Listening at port 3000.');
});