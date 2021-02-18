$(document).ready(function(){



    $('#department_btn').click(function(){
        $.ajax({
            url: '/ajaxdepartment',
            data: '',
            method: 'POST',
            success : function(res){
                //console.log(res);
                $('#data').html(res.toString());
            }
        });
    });

    $('#users_btn').click(function(){
        $.ajax({
            url: '/ajaxuser',
            data: '',
            method: 'POST',
            success : function(res){
                $('#data').html(res.toString());
            }
        });
    });

    $('#update_btn').click(function(){
        $('#data').load('users.html');
    });

    $('#attendence_btn').click(function(){
        $('#data').load('users.html');
    });


    $(window).scroll(function(){
        var st = $(window).scrollTop();
        var ot = $('#menue').offset().top;
        var lb= $('#logo').offset().top+$('#logo').outerHeight(true);
        console.log(st+' '+ot);
        if(st >= ot && lb<st) {
            $('#menue').css({
                position: "fixed",
                top: "0px"
            });
        } else {
            $('#menue').css({
                position: "relative",
            });
        }
    });


});