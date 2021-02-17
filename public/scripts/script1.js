$(document).ready(function(){



    $('#department_btn').click(function(){
        $.ajax({
            url: '/ajax',
            data: '',
            method: 'POST',
            success : function(res){
                //console.log(res);
                $('#data').html(res.toString());
            }
        });
    });

    $('#users_btn').click(function(){
        $('#data').load('users.html');
    });

    $('#update_btn').click(function(){
        $('#data').load('users.html');
    });

    $('#attendence_btn').click(function(){
        $('#data').load('users.html');
    });





});