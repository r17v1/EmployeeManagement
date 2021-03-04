let current_url = 'none';
let current_data = {
	sort: '',
	order: ''
};
let selected = null;
let default_set = [ false, false ];

let selected_color='white';



function updateSelected(){
	$('.menue_button').each((index,obj)=>{
		if(selected==obj){
			$(obj).addClass('selected_btn');
		}else{
			$(obj).removeClass('selected_btn');
		}
	});
}



$(document).ready(function() {
	let ajax_call = function(_url, _data) {
		$.ajax({
			url: _url,
			data: _data,
			method: 'POST',
			success: function(res) {
				//console.log(res);
				if (!_data.download)
					if (_url == '/ajaxupdate') {
						$('#update').html('<img src="images/success.png" alt="Success">');
					} else $('#data').html(res.toString());
				else {
					window.location = res.toString();
				}

				$('#fdate').ready(() => {
					if (!default_set[0]) {
						$('#fdate').val(new Date().toISOString().slice(0, 10));
						default_set[0] = true;
					}
				});

				$('#tdate').ready(() => {
					if (!default_set[1]) {
						$('#tdate').val(new Date().toISOString().slice(0, 10));
						default_set[1] = true;
					}
				});

				current_data = _data;
				current_url = _url;

				if(_url=='/ajaxuser'||_url=='/ajaxlog'){
					$('#settings_icon').css('display','block');
				}
			}
		});
	};

	let ajax_options = function(search, date, dept_list) {
		$.ajax({
			url: '/getoptions',
			data: {
				search: search,
				date: date,
				dept_list: dept_list
			},
			method: 'POST',
			success: function(res) {
				//console.log(res);
				$('#options').html(res.toString());
			}
		});
	};

	$('#logout_btn').click(()=>{
		window.location.replace('/logout');
	});

	$('#department_btn').click(function() {
		selected=this;
		updateSelected();
		$('#settings_icon').css('display','none');
		$('#update').css('display','none');
		$('#update').html('');
		data = {
			sort: 'Department ID',
			order: 'asc'
		};
		url = '/ajaxdepartment';

		ajax_call(url, data);
		$('#options').html('');
	});

	$('#users_btn').click(function() {
		$('#update').css('display','none');
		selected=this;
		updateSelected();
		$('#update').html('');
		data = {
			sort: 'User ID',
			order: 'asc',
			search: '',
			department: 'All'
		};
		url = '/ajaxuser';
		ajax_options(true, false, true);
		ajax_call(url, data);
	});

	$('#attendence_btn').click(function() {
		$('#update').css('display','none');
		selected=this;
		updateSelected();
		$('#update').html('');
		default_set = [ false, false ];
		data = {
			sort: 'Date',
			order: 'desc',
			tdate: new Date().toISOString().slice(0, 10),
			fdate: new Date().toISOString().slice(0, 10),
			search: '',
			department: 'All'
		};
		url = '/ajaxlog';
		ajax_options(true, true, true);
		ajax_call(url, data);
	});


	$('#update_btn').click(function() {
		$('#settings_icon').css('display','none');
		$('#update').css('display','block');
		selected=this;
		updateSelected();
		$('#data').html('');
		$('#options').html('');
		$('#update').html('<div class="loader"></div>');
		ajax_call('/ajaxupdate', current_data);
	});

	$('#data').on('click', 'table tr th', function() {
		current_data.download = false;
		let btn_name = this.textContent.trim();
		if (btn_name == 'Time') return;
		//alert(btn_name==current_data.sort);
		data = current_data;

		if (btn_name == current_data.sort) {
			if (current_data.order == 'asc') {
				(data.sort = btn_name), (data.order = 'desc');

				ajax_call(current_url, data);
			} else {
				(data.sort = btn_name), (data.order = 'asc');

				ajax_call(current_url, data);
			}
		} else {
			(data.sort = btn_name), (data.order = 'asc');
			ajax_call(current_url, data);
		}
	});

	$('#options').on('click', '#search_btn', () => {
		data = {
			sort: current_data.sort,
			order: current_data.order,
			search: ($('#search').val())?$('#search').val().trim():null,
			fdate:  $('#fdate').val(),
			tdate: $('#tdate').val(),
			department: $('#department_selecter option:selected').text()
		};
		ajax_call(current_url, data);
		//alert('clicked');
	});

	$('#options').on('click', '#dl_btn', () => {
		data = {
			sort: current_data.sort,
			order: current_data.order,
			search: $('#search').val().trim(),
			fdate: $('#fdate').val(),
			tdate: $('#tdate').val(),
			department: $('#department_selecter option:selected').text(),
			download: true
		};
		ajax_call(current_url, data);
		//alert('clicked');
	});

	$('#settings_icon').click(()=>{
		$('#overlay').css('display','block');
	});


	window.addEventListener('click', function(e){   
		if (	(document.getElementById('options').contains(e.target)||
				document.getElementById('settings_icon').contains(e.target))&&
				!(document.getElementById('search_btn').contains(e.target)||
				document.getElementById('dl_btn').contains(e.target))
			){
		  // Clicked in box
		} else{
			$('#overlay').css('display','none');
		}
	  });
	
});
