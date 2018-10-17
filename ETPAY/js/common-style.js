// 底部导航切换
$(".footer-item").click(function () {
    let index = $(this).index();
    $(this).addClass("active").siblings(".footer-item").removeClass("active");
});

// 动态设置K线、走势、1M、5M...等 的宽度
$(function () {
    let leng = $(".k-xian-items li").length;
    let widths = leng*.55 + "rem";
    $(".k-items").css("width",widths)
});

// 点击K线、走势、1M、5M...等的字体颜色
$(".k-item").click(function () {
    $(this).addClass("active").siblings(".k-item").removeClass("active")
});

// 动态设置K线、走势、1M、5M...等 的宽度
$(function () {
    let leng = $(".k-xian-items li").length;
    let widths = leng*.55 + "rem";
    $(".k-items").css("width",widths)
});


// 币种介绍
$(".down-up-icon").click(function () {
    $(this).toggleClass("active");
    $(".introduce-details").toggle();

});


