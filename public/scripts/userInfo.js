let myInfo=null;


$.ajax({
	url:'/getid',
	method:'POST',
	success: (res)=>{
		myInfo=res;
	}
});




let edit=false;

function isEmail(email) {
    email_list=email.split(',');
    let ret=true;
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    for(i=0;i<email_list.length;i++){
        ret= ret&&regex.test(email_list[i].trim());
    }
    return ret||email.length==0;
}
  

$(document).ready(function() {
    $('#submitEdit').click(()=>{
        if(edit && !isEmail($('#email').val())){
            $('#err_email').text('Please enter valid email!');
            return;
        }
        let isMe= myInfo.id==window.location.pathname.split('/')[2];
        let isAdmin=myInfo.type==2;
       
        $('#err_email').text('');

        $('.editable').each((index,obj)=>{
            obj.disabled=(edit || !isMe) ;
        });
        $('.admin_editable').each((index,obj)=>{
            obj.disabled=(edit || !isAdmin);
        });

        if(edit){
            $.ajax({
               url: '/ajaxuserinfo',
	    		data: {
                    uid: $('#uid').val(),
                    email: $('#email').val(),
                    address:$('#address').val(),
                    number:$('#number').val(),
                    alt_number:$('#alt_number').val(),
                    designation:$('#designation').val(),
                    salary:$('#salary').val(),
                    acc_type:$('#acc_type option:selected').text()
               },
	    		method: 'POST',
            });
        }
        edit=!edit;
        $('#submitEdit').html( edit?"Save":"Edit" );
    });

    $("#DPupdate").click(()=>{
        $('#profile_pic form').html('<input id="fileul" name="DP" type="file"  accept="image/*">');
        $('#profile_pic form').append('<input type="submit" id="upload" value="save">');
    });

    
});