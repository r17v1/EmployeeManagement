//import
const express = require('express');
const bps = require('body-parser');
const ejs = require('ejs');
const { query } = require('express');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const Excel = require('exceljs');
const session = require('express-session');
const { resolveSoa } = require('dns');
const { debug } = require('console');
const upload = require('express-fileupload');
const fs=require('fs');
const kill  = require('tree-kill');
const { Session } = require('inspector');


//Connect to database
let db = new sqlite3.Database(__dirname + '/database/database.db', (err) => {
	if (err) return console.error(err.message);
	console.log('connected to database successfully!');
});

//Set up imports
const app = express();
app.set('view engine', 'ejs');

app.use(
	bps.urlencoded({
		extended: true
	})
);


app.use(
	upload({
		createParentPath: true
	})
);


app.set('view engine', 'ejs');
app.use('/', express.static('public'));
app.use('/login', express.static('public'));
app.use('/profile', express.static('public'));
app.use(
	session({
		name: 'sid',
		secret:
			'jotato! Dio! hoho! ora ora ora ora ora muda muda muda muda muda muda nani!!!! za wardu!!! tomare toki o.',
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 30,
			sameSite: true,
			secure: false
		}
	})
);

let python=null;
let timeOutID=null;
function update(res){
	let timeOutID= setTimeout(()=>{
		if(python){
			spawn("taskkill", ["/pid", python.pid, '/f', '/t']);
			console.log('kill');
			python=null;
			if(res)
				res.send('failed');
			timeOutID=null;
		}
	},30000)
	if(python){
	
		python.on('close',(code)=>{
			if(res)
				res.send('success');
			python=null;
			if(timeOutID){
				clearTimeout(timeOutID);
				timeOutID=null;
			}
		});
		
		return;
	}else{
		python = spawn('python',[__dirname+'\\python\\scrapper.py'])//spawn(__dirname+'\\scrapper\\scrapper.exe' );
		python.on('close', (code) => {
			if(res)
				res.send('success');			
			python=null;
			
			if(timeOutID){
				clearTimeout(timeOutID);
				timeOutID=null;
			}
		});
	}
}

//Listen for incomming requests
app.listen(3000, function() {
	console.log('Listening at port 3000.');
	update();
});

app.get('/profile/:val',(req,res)=>{
	if(!req.session.userId){
		res.redirect('/login');
		return;
	}
	if(req.params.val=='me'){res.redirect('/profile/'+Number(req.session.userId)); return;}

	let edit=false,myProfile=false;
	if(req.session.userType==2)
		edit=true;
	if(Number(req.params.val)==Number(req.session.userId) ){
		myProfile=true;
		edit=true;
	}

	if(!myProfile && req.session.userType<1) {res.redirect('/profile/'+Number(req.session.userId)); return;}

	var UID=req.params.val;
	let qry=	'select user.id as id, user.name as name,(select type from login where cast(username as NUMERIC)=user.id)as type, (select name from department where id=user.department_id)as dept_name,'+ 
	'email, phone_no,alt_no,salary, address, designation from user,userInfo where user.id=userInfo.id and user.id=+'+UID+';';
	db.all(qry,(err,rows)=>{
		let dp= fs.existsSync(__dirname+'\\public\\images\\profile\\'+UID)	? 
				'/images/profile/'+UID :
				'/images/profile/default';
		
				res.render('profile',{
			user:{
				id:rows[0].id,
				name:rows[0].name,
				department:rows[0].dept_name,
				designation:rows[0].designation,
				email:rows[0].email,
				number:rows[0].phone_no,
				alt_number:rows[0].alt_no,
				salary:rows[0].salary,
				address:rows[0].address,
				dp:dp,
				acc_types : [['Regular',Number(rows[0].type)==0],['View Access',Number(rows[0].type)==1],['Admin Access',Number(rows[0].type)==2]]
			}, 
			edit:edit,
			myProfile:myProfile
		});
	})
});

//Login
app.get('/login', (req,res)=>{
	if(req.session.userId){ 
		res.redirect('/');
		return;
	}
	res.sendFile('login.html',{root: __dirname});
	update();
});

app.post('/ajaxlogin',(req,res)=>{
	let letters = /^[0-9a-zA-Z]+$/;
	let username=req.body.username;
	if(!letters.test(username) ||username.length!=4 )
	{
		res.send('failed');
		return;
	}
	db.all('select * from login where username ="'+username+'";',(err, row)=>{
		if(err){
			console.log(err);
			res.send('failed');
		}else{
			if (row.length) {
				let password='';
				if(row[0].autopass==1) password=req.body.password;
				else{
					for(let i=0;i<req.body.password.length;i++){
						password+=req.body.password.charCodeAt(i).toString(32);
					}
				}
				if(password==row[0].password){
					req.session.userId = req.body.username;
					req.session.userType = row[0].type;
					req.session.firstLogin= (row[0].autopass==1);
					res.send('success');
				}else res.send('failed');
			} else res.send('failed');
		}
	});
});


//Home screen'
//Send the home.html file when url is visited
app.get('/', function(req, res) {
	if(!req.session.userId)
		res.redirect('/login');
	else if(req.session.firstLogin){
		res.redirect('/updatePassword')
	}
	else
	/*res.sendFile('home.html', {
		root: __dirname
	});*/
	res.render('home')
});

//Update Password screen
app.get('/updatePassword',(req,res)=>{
	if(!req.session.userId)
		res.redirect('/login');
	else //res.sendFile('updatePassword.html',{root:__dirname});
	res.render('updatePassword');
});


//AJAX POST request to get department data
//--------------------------------------------------------------------------------------------------
app.post('/ajaxdepartment', function(req, res) {
	if(!req.session.userId) return;
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

//AJAX POST to get user data
//--------------------------------------------------------------------------------------------------------------
app.post('/ajaxuser', function(req, res) {
	if(!req.session.userId) return;
	//req.body contains sort and search information
	var sort;
	if (req.body.sort == 'User ID') sort = 'id ' + req.body.order;
	else if (req.body.sort == 'Department Name')
		//sort by user ID
		sort = 'dept_name ' + req.body.order;
	else if (req.body.sort == 'Name')
		//Sort by department name
		sort = 'name ' + req.body.order; //sort by user name
	var query =
		'select (select name from department where id=user.department_id)as dept_name, user.id as id,'+
		' user.name as name,designation, phone_no,alt_no,email from user,userInfo ';
	let flag = false;
	var search = '';
	var search_id = [];
	if (req.body.search != '') {
		let words = req.body.search.split(','); //search is a comma seperated list, split all search keys
		for (let i = 0; i < words.length; i++) {
			if (i == 0) {
				search = 'where (name like "%' + words[i].trim() + '%" '; //creating search sql code to querry
				flag = true;
			} else {
				search = search + 'or name like "%' + words[i].trim() + '%" '; //if there are multiple search keys
			}
			if (!isNaN(words[i])) {
				//if the search key is a number, it might be user ID
				search_id.push(words[i].trim());
			}
		}
	}
	if (search != '') {
		query = query + search; //sppending search querry to main querry
	}
	if (search_id.length > 0) {
		query += 'or id in (' + search_id.join(',') + ') '; //Appending search by ID querry
	}

	if (flag) {
		query += ') ';
	}

	//Adding department constraint so sql querry
	if (req.body.department != 'All') {
		var extra = 'and ';
		if (!flag) {
			extra = 'where ';
			flag=true;
		}
		if (req.body.department == 'Not Assigned') {
			query += extra + 'dept_name is null ';
		} else {
			query += extra + 'dept_name like "' + req.body.department + '" ';
		}
	}
	extra='and ';
	if(!flag){
		extra='where ';
		flag=true;
	}
	query+= extra+'user.id=userInfo.id ';

	//setting sort and order constraint
	query += 'order by ' + sort + ';';

	//running the querry
	db.all(query, function(err, rows) {
		data = [
			[ 'User ID', 'Name','Designation','Phone Number','Alternate Number','Email', 'Department Name' ] //Heading
		];
		if (err) {
			console.log(err.message);
		} else
			rows.forEach((row) => {
				data.push([ row.id, row.name,row.designation,row.phone_no,row.alt_no,row.email, row.dept_name ]); //pushing data
			});
		if (req.body.download != 'true') {
			res.render('table', {
				//sending data
				data: data,
				viewAccess: req.session.userType>=1
			});
		} else {
			//if download is true, generate excel file and send it for download
			let workbook = new Excel.Workbook();
			let worksheet = workbook.addWorksheet('Sheet1');
			data.forEach((row) => {
				worksheet.addRow(row);
			});
			worksheet.columns.forEach((column) => {
				(column.width = 25),
					(column.alignment = {
						horizontal: 'left'
					});
			});
			worksheet.getRow(1).font = {
				bold: true
			};
			workbook.xlsx.writeFile(__dirname + '/public/data.xlsx').then(
				setTimeout(() => {
					res.send('/data.xlsx');
				}, 500)
			);
		}
	});
});

//POST to get log data
//-----------------------------------------------------------------------------------------------
app.post('/ajaxlog', function(req, res) {
	if(!req.session.userId)return;	
	let sort;
	if (req.body.sort == 'Date') sort = 'timestamp ' + req.body.order;
	else if (req.body.sort == 'ID') sort = 'user_id ' + req.body.order;
	else if (req.body.sort == 'Name') sort = 'user_name ' + req.body.order;
	else if (req.body.sort == 'Department') sort = 'dept_name ' + req.body.order;
	else console.log('sort error');
	let query =
		'select date(timestamp) as _date, user_id, (select name from user where user.id=log.user_id) as user_name,'+
		' (select department.name from department where department.id=(select user.department_id from user where user.id=log.user_id)'+
		' )as dept_name from log GROUP by user_id, date(timestamp) ';
	let flag = false;
	let search = '';
	let search_id = [];
	if (req.body.search != '' && req.session.userType>=1) {
		let words = req.body.search.split(',');
		for (let i = 0; i < words.length; i++) {
			if (i == 0) {
				search = 'having (user_name like "%' + words[i].trim() + '%" ';
				flag = true;
			} else {
				search = search + 'or user_name like "%' + words[i].trim() + '%" ';
			}
			if (!isNaN(words[i])) {
				search_id.push(words[i].trim());
			}
		}
	}
	if (search != '') {
		query = query + search;
	}
	if (search_id.length > 0) {
		query += 'or user_id in (' + search_id.join(',') + ') ';
	}
	if (flag) {
		query += ') ';
	}

	

	if(req.session.userType<1){
		query+='having user_id='+req.session.userId+' ';
		flag=true;
	}

	else if (req.body.department != 'All') {
		var extra = 'and ';
		if (!flag) {
			extra = 'having ';
			flag = true;
		}
		if (req.body.department == 'Not Assigned') {
			query += extra + 'dept_name like"" ';
		} else {
			query += extra + 'dept_name like "' + req.body.department + '" ';
		}
	}

	if (flag) {
		query += 'and _date >= "' + req.body.fdate + '" and _date <= "' + req.body.tdate + '" ';
	} else {
		query += 'having _date >= "' + req.body.fdate + '" and _date <= "' + req.body.tdate + '" ';
	}

	query += 'order by ' + sort + ';';
	//console.log(query);
	let p = new Promise((resolve, reject) => {
		db.all(query, function(err, rows) {
			data = [ [ 'Date', 'ID', 'Name', 'Department' ] ];
			if (err) {
				reject(console.log(err.message));
			} else {
				rows.forEach((row) => {
					data.push([ row._date, row.user_id, row.user_name, row.dept_name ]);
				});
				resolve();
			}
		});
	});

	let finalrender = function(data, req, res) {
		if(req.body.fullReport=='true'){
		len = 0;
		data.forEach((row) => {
			len = Math.max(len, row.length);
		});
		for (let i = 0; i < data.length; i++) {
			while (data[i].length < len) {
				if (i == 0) data[i].push('Time');
				else data[i].push('');
			}
		}
		}else{
			
			for (let i = 0; i < data.length; i++) {
				if(i==0){
					data[i].push(['Entry Time']);
					data[i].push(['Exit Time']);
				}
				else if(data[i].length>5)
					data[i][5]=data[i][data[i].length-1];
				data[i].length=6;
			}
			
		}
		if (req.body.download != 'true') {
			res.render('table', {
				data: data
			});
		} else {
			let workbook = new Excel.Workbook();
			let worksheet = workbook.addWorksheet('Sheet1');
			data.forEach((row) => {
				worksheet.addRow(row);
			});
			worksheet.columns.forEach((column) => {
				(column.width = 25),
					(column.alignment = {
						horizontal: 'left'
					});
			});
			worksheet.getRow(1).font = {
				bold: true
			};
			workbook.xlsx.writeFile(__dirname + '/public/data.xlsx').then(
				setTimeout(() => {
					res.send('/data.xlsx');
				}, 500)
			);
		}
	};

	p.then(() => {
		if (data.length == 1) {
			finalrender(data, req, res);
			return;
		}
		let j = 1;
		for (let i = 1; i < data.length; i++) {
			let query =
				'select time(timestamp)as time from log where date(timestamp)="' +
				data[i][0] +
				'" and user_id="' +
				data[i][1] +
				'";';
			db.all(query, function(err, rows) {
				if (err) {
					console.log(err.message);
				} else
					rows.forEach((row) => {
						data[i].push(row.time);
					});
				if (j == data.length - 1) {
					finalrender(data, req, res);
				}
				j++;
			});
		}
	});
});

//Post to get options html data
app.post('/getoptions', function(req, res) {
	if(!req.session.userId) return;
	db.all('select name from department;', function(err, rows) {
		departments = [];
		if (err) {
			console.log(err.message);
		} else
			rows.forEach((row) => {
				departments.push(row.name);
			});
		res.render('options', {
			search: (req.body.search == 'true')&&(req.body.date != 'true'||req.session.userType>=1),
			date: req.body.date == 'true',
			dept_list: (req.body.dept_list == 'true')&&(req.body.date != 'true'||req.session.userType>=1),
			departments: departments,
			headers:['Date','Name'],
			report: req.body.report=='true'
		});
	});
});

//POST  to update database
app.post('/ajaxupdate', function(req, res) {
	//call scrapper python script to update database
	update(res);
});



//POST to change password
app.post('/ajaxchangepassword',(req,res)=>{
	if(!req.session.userId) return;
	let username=req.session.userId;
	db.all('select * from login where username ="'+username+'";',(err, row)=>{
		if(err){
			console.log(err);
			res.send('failed');
		}else{
			if (row.length) {

				let password='';
				if(row[0].autopass==1) password=req.body.current_pwd;
				else{
					for(let i=0;i<req.body.current_pwd.length;i++){
						password+=req.body.current_pwd.charCodeAt(i).toString(32);
					}
				}

				if(password==row[0].password){
					let newPassword='';
					for(let i=0;i<req.body.new_pwd.length;i++){
						newPassword+=req.body.new_pwd.charCodeAt(i).toString(32);
					}

					db.all('update login set password="'+newPassword+'", autopass=2 where username="'+username+'";',(err)=>{
						if(err){
							res.send('failed');
							console.log(err);
						}else{
							req.session.firstLogin=false;
							res.send('success');
						}
					})

				}else{
					res.send('failed');
				}
			} else res.send('failed');
		}
	});
});


//LOGOUT
app.get('/logout',(req,res)=>{
	req.session.destroy();
	res.redirect('/login');
})



//update user info
app.post('/ajaxuserinfo',(req,res)=>{
	if(!req.session.userId)return;
	let query;
	if(Number(req.body.uid)==Number(req.session.userId)){
		query='update userInfo set email="'+req.body.email+'", phone_no="'+req.body.number+'", alt_no="'+
		req.body.alt_number+'", address="'+req.body.address+ '" where id='+req.session.userId+' ;';
		db.all(query);
	}

	if(req.session.userType==2){
		query='update userInfo set designation="'+req.body.designation+'", salary="'+req.body.salary + 
		'" where id='+req.body.uid+' ;';
		db.all(query);
		accTypes={
			'Regular':0,
			'View Access':1,
			'Admin Access':2
		}
		query='update login set type='+accTypes[req.body.acc_type]+' where username="'+String(req.body.uid).padStart(4,'0')+'" ;';
		db.all(query);
	}
});

//profile pic
app.post('/profile',(req,res)=>{
	if(!req.session.userId)res.redirect('/login');
	console.log(req);
	if(req.files)
	{	
		let DP=req.files.DP;
		DP.mv(__dirname+'\\public\\images\\profile\\'+Number(req.session.userId));
	}
	res.redirect('/profile/me');
});



app.post('/getid',(req,res)=>{
	if(!req.session.userId)return;
	res.send({
		id:req.session.userId,
		type: req.session.userType
	});
})