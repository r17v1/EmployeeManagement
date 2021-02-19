let current_url='none';
let current_data={sort:'', order:''};



$(document).ready(function(){

    let ajax_call=function(_url, _data){
        $.ajax({
            url: _url,
            data: _data,
            method: 'POST',
            success : function(res){
                //console.log(res);
                $('#data').html(res.toString());
                current_data=_data;
                current_url=_url;
            }
        });
    };

    $('#department_btn').click(function(){
        
        data={
            sort:'Department ID',
            order:'asc'
        };
        url='/ajaxdepartment';

        ajax_call(url,data);

    });

    $('#users_btn').click(function(){
        data={
            sort:'User ID',
            order:'asc'
        };
        url='/ajaxuser';

        ajax_call(url,data);

    });

    $('#update_btn').click(function(){
        $('#data').load('users.html');
    });

    $('#attendence_btn').click(function(){
        data={
            sort:'Date',
            order:'desc'
        };
        url='/ajaxlog';

        ajax_call(url,data);
    });


    $(window).scroll(function(){
        var st = $(window).scrollTop();
        var ot = $('#menue').offset().top;
        var lb= $('#logo').offset().top+$('#logo').outerHeight(true);
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

    $('#data').on('click','table tr th',function(){
        let btn_name=this.textContent.trim();
        if(btn_name=='Time') return;
        //alert(btn_name==current_data.sort);
        if(btn_name==current_data.sort){
            if(current_data.order=='asc'){
                data={
                    sort: btn_name,
                    order:'desc'
                }
                ajax_call(current_url,data);
            }else{
                data={
                    sort: btn_name,
                    order:'asc'
                }
                ajax_call(current_url,data);
            }
        }else{
            data={
                sort: btn_name,
                order:'asc'
            }
            ajax_call(current_url,data);
        }
    });

});
