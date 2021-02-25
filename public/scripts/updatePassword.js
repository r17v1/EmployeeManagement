function checkPassword(inputtxt) {
	var decimal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,12}$/;
	if (inputtxt.match(decimal)) {
		return true;
	} else {
		return false;
	}
}

let constraint= 'Password must contain uppercase letter(s)'+
                        ', lowercase letter(s), number(s), special character(s)'+
                        ' and must be between 8 to 12 characters long!';

$(document).ready(function() {
    let ret=false;

    $('#new_pwd').keyup(()=>{
        if (!checkPassword($('#new_pwd').val() )) {
            $('#pwd_constraint_change').text(constraint);
            ret=true;
        }else{
            $('#pwd_constraint_change').text('');
        }
    });

    $('#cnew_pwd').keyup(()=>{
        if ($('#new_pwd').val() != $('#cnew_pwd').val()) {
			$('#pwd_mismatch_change').text('New password and confirm password must match');
			ret=true;
		}else{
            $('#pwd_mismatch_change').text('');
        }
    });

	$('#submit_change_password').click(() => {
        let ret=false;
        if (!checkPassword($('#new_pwd').val() )) {
            $('#pwd_constraint_change').text(constraint);
            ret=true;
        }else{
            $('#pwd_constraint_change').text('');
        }
        
        if ($('#new_pwd').val() != $('#cnew_pwd').val()) {
			$('#pwd_mismatch_change').text('New password and confirm password must match');
			ret=true;
		}else{
            $('#pwd_mismatch_change').text('');
        }

		if($('#new_pwd').val() == $('#current_pwd').val()){
			$('#pwd_constraint_change').text('New password cannot be the same as old password!');
			ret=true;
		}else{
			$('#pwd_constraint_change').text('');
		}
        if(ret) return;


		$.ajax({
			url: '/ajaxchangepassword',
			method: 'POST',
			data: {
				current_pwd: $('#current_pwd').val(),
				new_pwd: $('#new_pwd').val()
			},
			success: (res) => {
				console.log(res);
				if (res == 'success') {
                    window.location.replace('/');
				} else {
					$('#pwd_err').text('Incorrect password!');
					$('#pwd_mismatch_change').text('');
				}
			}
		});
	});
});
