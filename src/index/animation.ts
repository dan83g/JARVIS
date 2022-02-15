import * as $ from 'jquery';

export function beam_animation(): void {
    $(".hero").addClass("herofront-fly-in-animation").css('opacity',1);
    setTimeout(function(){

        setTimeout(function(){
            $("#herofront").removeClass("herofront-flare-animation");
            $(".heroshadow").removeClass("heroshadow-idle");
            $("#herofront").css({'margin-top': '42px','margin-left': '0px'});
            $("#herofront").hide(0);
            $("#heroright").show(0);
            //hero shadow liftup
            $(".heroshadow").unbind();
            $(".heroshadow").bind("animationend webkitAnimationEnd oAnimationEnd",function(){
                $(".heroshadow").removeClass("heroshadow-liftup");
                $(".heroshadow").unbind();
                $(".heroshadow").css({transform: 'scale(0.9, 0.5) translateX(80px)'});
            });
            $(".heroshadow").addClass('heroshadow-liftup');
            $("#heroright").animate({
                'margin-top': '42px',
                'margin-left': '0px'
                }, 500, function() {
                    //cape animation
                    $("#heroright").css("background-position", "0px center");
                    //start animation after hero lifted up
                    $(".beam").bind("animationend webkitAnimationEnd oAnimationEnd",function(){
                        $(".beam").removeClass("beam-animation");
                        $(".burner").removeClass("burner-animation");
                        //hero shadow liftdown
                        $(".heroshadow").unbind();
                        $(".heroshadow").bind("animationend webkitAnimationEnd oAnimationEnd",function(){
                            $(".heroshadow").unbind();
                            $(".heroshadow").removeClass("heroshadow-liftdown");
                            $(".heroshadow").css({transform: 'scale(1) translateX(0px)'});
                        });
                        $(".heroshadow").addClass('heroshadow-liftdown');
                        //lift hero down
                        $("#herofront").show(0);
                        $("#heroright").css({'margin-top': '80px','margin-left': '-20px'});
                        $("#heroright").hide(0);
                        $("#herofront").animate({
                            'margin-top': '80px',
                            'margin-left': '-20px'
                            },500,function() {
                                $("#heroright").css("background-position", "-250px center");
                                $("#herofront").addClass("herofront-flare-animation");
                                $(".heroshadow").addClass("heroshadow-idle");
                                $("#textSearch").parent().css({'z-index': '50'});                                
                                $(".beam").css({'width': '0'});
                                $(".burner").css({'width': '0'});
                            });
                    });
                    $(".beam").addClass("beam-animation");
                    $(".burner").addClass("burner-animation");
                });
        },1000);
    },500);
};
