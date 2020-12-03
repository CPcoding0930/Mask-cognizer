    // Get value of the mode
    //$('.optionBtn').click(function () {
    //    var value = $('.custom-control-input:checked').val();
    //    alert(value); 
    //});

    $(document).ready(function() {

        $('.optionBtn').click(function() {
            sessionStorage.setItem("mode", $('.custom-control-input:checked').val());
        });
    }); 