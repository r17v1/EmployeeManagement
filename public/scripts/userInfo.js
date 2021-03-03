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
        $('#err_email').text('');

        $('.editable').each((index,obj)=>{
            obj.disabled=edit;
     });
     if(edit){
         $.ajax({
            url: '/ajaxuserinfo',
			data: {
                email: $('#email').val(),
                address:$('#address').val(),
                number:$('#number').val()
            },
			method: 'POST',
            success: ()=>{ console.log('yo mama');}
         });
     }
     edit=!edit;
     $('#submitEdit').html( edit?"Submit":"Edit" );
    });

    $("#DPupdate").click(()=>{
        $('#profile_pic form').html('<input id="fileul" name="DP" type="file"  accept="image/*">');
        $('#profile_pic form').append('<input type="submit" id="upload">');
    });

    /*$('#profile_pic').on('click','#upload',()=>{
        alert('click');
    });*/
});