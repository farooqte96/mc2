// create ajax request using jquery

$(document).ready(function(){
  //grab delete cloudlet Class
  $('.delete-cloudlet').on('click', function(e){
      //e is event variable
    //to grab data attribute i.e data-id we use e.target
    $target=$(e.target);
    const id=$target.attr('data-id');
    //make ajax request
    $.ajax({
      type:'DELETE',
      url:'/cloudlet/'+id,
      success: function(response){
        alert('Deleting Cloudlet');
        //redirect it to main page using window.location attribute
        window.location.href='/';
      },
      error: function(error){
        console.log(error);
      }
    });
  });
});


$(document).ready(function(){
  //grab delete cloudlet Class
  $('.delete-profile').on('click', function(e){
      //e is event variable
    //to grab data attribute i.e data-id we use e.target
    $target=$(e.target);
    const id=$target.attr('data-id');
    //make ajax request
    $.ajax({
      type:'DELETE',
      url:'/profile/'+id,
      success: function(response){
        alert('Deleting Profile');
        //redirect it to main page using window.location attribute
        window.location.href='/';
      },
      error: function(error){
        console.log(error);
      }
    });
  });
});
