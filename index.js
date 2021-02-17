const express = require('express');
const bps = require('body-parser');
const httpMsgs = require('http-msgs');
const ejs = require('ejs');


const app = express();

app.set('view engine', 'ejs');

app.use(
	bps.urlencoded({
		extended: true
	})
);

app.set('view engine', 'ejs');

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





app.post('/ajax',function(req,res){

	data=[['Demo','Place'],['Datal','Data2l']];

	console.log(ejs.renderFile('views/table.ejs',{data:data}));
	//res.send(ejs.renderFile('html/table.html',{data:data}));
	res.render('table',{data:data});
	//httpMsgs.sendHTML(req,res,ejs.renderFile('html/table.html',{data:data}),true);
	
});