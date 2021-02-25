$(document).ready(function() {
    $('#submit').click(()=>{
        $.ajax({
            url: '/ajaxlogin',
			data: {
                username: $('#username').val(),
                password: $('#pwd').val()
            },
			method: 'POST',
			success: (res)=>{
                if(res=='success'){
                    window.location.replace('/');
                }else{
                    $('#error_message').text('Invalid username or password!');
                }
            }
        });
    })
});