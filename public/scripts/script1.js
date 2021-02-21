let current_url='none';
let current_data={sort:'', order:''};
let default_set=[false,false];


$(document).ready(function(){

    let ajax_call=function(_url, _data){
        $.ajax({
            url: _url,
            data: _data,
            method: 'POST',
            success : function(res){
                //console.log(res);
                if(!_data.download)
                    $('#data').html(res.toString());
                else{
                   window.location=res.toString();
                }
                
                $('#fdate').ready(()=>{
                    if(!default_set[0]){
                        $('#fdate').val(new Date().toISOString().slice(0, 10));
                        default_set[0]=true;
                     }   
                });

                $('#tdate').ready(()=>{
                    if(!default_set[1]){
                        $('#tdate').val(new Date().toISOString().slice(0, 10));
                        default_set[1]=true;
                     }
                });

                current_data=_data;
                current_url=_url;
            }
        });
    }

    let ajax_options= function(search, date, dept_list){
        $.ajax({
            url: '/getoptions',
            data: {
                search:search,
                date:date,
                dept_list:dept_list
            },
            method: 'POST',
            success : function(res){
                //console.log(res);
                $('#options').html(res.toString());
            }
        });
    }

    $('#department_btn').click(function(){
        
        data={
            sort:'Department ID',
            order:'asc'
        };
        url='/ajaxdepartment';
       
        ajax_call(url,data);
        $('#options').html('');

    });

    $('#users_btn').click(function(){
        data={
            sort:'User ID',
            order:'asc',
            search : '',
            department:'All'
        };
        url='/ajaxuser';           
        ajax_options(true,false,true);
        ajax_call(url,data,);
    });

    $('#update_btn').click(function(){
        $('#data').load('users.html');
    });

    $('#attendence_btn').click(function(){
        default_set=[false,false];
        data={
            sort:'Date',
            order:'desc',
            tdate: new Date().toISOString().slice(0, 10),
            fdate: new Date().toISOString().slice(0, 10),
            search: '',
            department: 'All'
        };
        url='/ajaxlog';
        ajax_options(true,true,true);
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

    $('#options').on('click','#search_btn', ()=>{
       
            data={
                sort:current_data.sort,
                order:current_data.order,
                search: $('#search').val().trim(),
                fdate: $('#fdate').val(),
                tdate: $('#tdate').val(),
                department: $( "#department_selecter option:selected" ).text()
            }
            ajax_call(current_url,data);
            //alert('clicked');
    });

    $('#options').on('click','#dl_btn', ()=>{
       
        data={
            sort:current_data.sort,
            order:current_data.order,
            search: $('#search').val().trim(),
            fdate: $('#fdate').val(),
            tdate: $('#tdate').val(),
            department: $( "#department_selecter option:selected" ).text(),
            download:true
        }
        ajax_call(current_url,data);
        //alert('clicked');
});

});


