const express = require('express');
const bps = require('body-parser');
const ejs = require('ejs');
const { query } = require('express');
const {spawn} = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const Excel=require('exceljs');



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

app.get('/', function(req, res) {
	res.sendFile('home.html', {
		root: __dirname
	});
});


app.listen(3000, function() {
	console.log('Listening at port 3000.');
});

app.post('/ajaxdepartment', function(req, res) {
	let query = 'select * from department;';
	db.all(query, function(err, rows) {
		data = [ [ 'Department ID', 'Department Name', 'Number of People' ] ];
		if (err) {
			console.log(err.message);
		} else
			rows.forEach((row) => {
				data.push([ row.id, row.name, row.count ]);
			});
		res.render('table', {
			data: data
		});
	});
});

app.post('/ajaxuser', function(req, res) {

	var sort;
	if(req.body.sort=='User ID') sort='id '+req.body.order;
	else if(req.body.sort=='Department Name') sort='dept_name '+req.body.order;
	else if(req.body.sort=='Name') sort='name '+req.body.order;
	var query="select (select name from department where id=user.department_id)as dept_name, user.id as id, user.name as name from user ";
	let flag=false;
	var search='';
	var search_id=[];
	if(req.body.search!=''){
		let words=req.body.search.split(',');
		for(let i=0;i<words.length;i++){
			if(i==0){
				search='where (name like "%'+words[i].trim()+'%" ';
				flag=true;
			}
			else{
				search =search+ 'or name like "%'+words[i].trim()+'%" ';
			}
			if(!isNaN(words[i])){
				search_id.push(words[i].trim());
			}
		}
	}
	if(search!=''){
		query=query+search;
	}
	if(search_id.length>0){
		query+= 'or id in ('+search_id.join(',')+') ';
	}

	if(flag){
		query+=') ';
	}

	if(req.body.department!='All'){
		var extra='and ';
		if(!flag){
			extra='where '
		}
		if(req.body.department=='Not Assigned'){
			query+=extra+'dept_name is null ';
		}else{
			query+=extra+'dept_name like "'+req.body.department+'" ';
		}
	}

	query+='order by '+sort+';';

	db.all(query, function(err, rows) {
		data = [ [  'User ID', 'Name','Department Name' ] ];
		if (err) {
			console.log(err.message);
		} else
			rows.forEach((row) => {
				data.push([ row.id, row.name,row.dept_name ]);
			});
		if(req.body.download!='true'){
			res.render('table', {
				data: data
			});
		}else{
			let workbook= new Excel.Workbook();
			let worksheet= workbook.addWorksheet('Sheet1');
			data.forEach((row)=>{
				worksheet.addRow(row);
			});
			worksheet.columns.forEach(column => {
				column.width = 25,
				column.alignment={horizontal:'left'}
			  });
			worksheet.getRow(1).font = {bold: true};
		 	workbook.xlsx.writeFile(__dirname+'/public/data.xlsx').then(setTimeout(()=>{
				res.send('/data.xlsx')
			},500));
			 
		}
	});
});

app.post('/ajaxlog', function(req, res) {

	var sort;
	if(req.body.sort=='Date') sort='_date '+req.body.order;
	else if(req.body.sort=='ID') sort='user_id '+req.body.order;
	else if(req.body.sort=='Name') sort='user_name '+req.body.order;
	else if(req.body.sort=='Department') sort='dept_name '+req.body.order;
	else console.log('sort error');
	let query='select date(timestamp) as _date, user_id, (select name from user where user.id=log.user_id) as user_name, (select department.name from department where department.id=(select user.department_id from user where user.id=log.user_id) )as dept_name from log GROUP by user_id, date(timestamp) ';




	let flag=false;
	var search='';
	var search_id=[];
	if(req.body.search!=''){
		let words=req.body.search.split(',');
		for(let i=0;i<words.length;i++){
			if(i==0){
				search='having (user_name like "%'+words[i].trim()+'%" ';
				flag=true;
			}
			else{
				search =search+ 'or user_name like "%'+words[i].trim()+'%" ';
			}
			if(!isNaN(words[i])){
				search_id.push(words[i].trim());
			}
		}
	}
	if(search!=''){
		query=query+search;
	}
	if(search_id.length>0){
		query+= 'or user_id in ('+search_id.join(',')+') ';
	}

	if(flag){
		query+=') ';
	}

	if(req.body.department!='All'){
		var extra='and ';
		if(!flag){
			extra='having ';
			flag=true;
		}
		if(req.body.department=='Not Assigned'){
			query+=extra+'dept_name like"" ';
		}else{
			query+=extra+'dept_name like "'+req.body.department+'" ';
		}
	}

	if(flag){
		query+='and _date >= "'+req.body.fdate+'" and _date <= "'+req.body.tdate+'" ';
	}else{
		query+='having _date >= "'+req.body.fdate+'" and _date <= "'+req.body.tdate+'" ';
	}

	query+='order by '+sort+';';


	
	let p= new Promise( (resolve,reject) => {
		/*let query =
		'select date(timestamp) as _date, user_id, (select name from user where user.id=log.user_id) as user_name, (select department.name from department where department.id=(select user.department_id from user where user.id=log.user_id) )as dept_name from log GROUP by user_id, date(timestamp) order by '+sort+';';
		*/
		db.all(query,  function(err,rows){
			data=[['Date', 'ID', 'Name', 'Department']];
			if (err) {
				reject(console.log(err.message));
			} else{
				rows.forEach((row) => {
					data.push([ row._date, row.user_id, row.user_name, row.dept_name ]);
				});
				resolve();
			}
			
		})
	
	});

	let finalrender = function(data,req,res){
		len=0;
		data.forEach((row)=>{
			len=Math.max(len,row.length);
		});
		for(let i=0;i<data.length;i++){
			while(data[i].length<len){
				if(i==0) data[i].push('Time');
				else data[i].push('');
			}
		}
		if(req.body.download !='true'){
			res.render('table', {
				data: data
			});
		}else{
			let workbook= new Excel.Workbook();
			let worksheet= workbook.addWorksheet('Sheet1');
			data.forEach((row)=>{
				worksheet.addRow(row);
			});
			worksheet.columns.forEach(column => {
				column.width = 25,
				column.alignment={horizontal:'left'}
			  });
			worksheet.getRow(1).font = {bold: true};
		 	workbook.xlsx.writeFile(__dirname+'/public/data.xlsx').then(setTimeout(()=>{
				 res.send('/data.xlsx')
			 },500));
		}
	}

	p.then(()=>{

		if(data.length==1){
			finalrender(data,req,res);
			return;
		}
		let j=1;
		for(let i=1; i<data.length;i++){
			
			let query='select time(timestamp)as time from log where date(timestamp)="'+data[i][0]+'" and user_id="'+data[i][1]+'";';
			db.all(query,  function(err,rows){
				if (err) {
					console.log(err.message);
				} else
					rows.forEach( (row) => {
						data[i].push(row.time);
					});
				if(j==data.length-1){
					
					finalrender(data,req,res);
				}
				j++;	
			});
		}
	});

});


app.post('/getoptions', function(req,res){
	db.all('select name from department;', function(err,rows){
		departments=[];
		if (err) {
			console.log(err.message);
		} else
			rows.forEach( (row) => {
				departments.push(row.name);
			});
			res.render('options',{
				search:req.body.search=='true',
				date: req.body.date=='true',
				dept_list:req.body.dept_list=='true',
				departments:departments
			});
	});
	
});


app.post('/ajaxupdate',function(req,res){
	const python = spawn('python', ['department_scrapper.py']);
	python.on('close',()=>{
		const python2=spawn('python',['user_scrapper.py']);
		python2.on('close',()=>{
			const python3=spawn('python',['log_scrapper.py']);
			python3.on('close',()=>{
				res.send('success');
			});
		});
	});
});