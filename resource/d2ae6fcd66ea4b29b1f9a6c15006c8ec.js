// SLIDER
var userSlider = document.querySelector('.slider-block');
var userSliderInner = document.querySelector('.slider-block-inner');

var slideWidth = 50;
var userSlides = document.querySelectorAll('.slider-item');
var userSlideLength = userSlides.length;
var btnPrev = document.querySelector('.prev-btn');
var btnNext = document.querySelector('.next-btn');
var userCurrenSlide = 0;

userSliderInner.style.setProperty("--sliderWidth", userSlideLength * slideWidth);
userSliderInner.style.setProperty("--sliderCount", userSlideLength);
userSliderInner.style.width = userSlideLength * slideWidth + '%';
btnPrev.onclick = scrollToPrev;
btnNext.onclick = scrollToNext;

function scrollToNext() {
    userCurrenSlide++;
    if (userCurrenSlide > userSlideLength - 2) {
        userCurrenSlide = 0;
    }
    userSliderInner.style.setProperty("--sliderCurrent", userCurrenSlide);
    userSliderInner.style.left = -(slideWidth * userCurrenSlide) + '%';
}

function scrollToPrev() {
    userCurrenSlide--;
    if (userCurrenSlide < 0) {
        userCurrenSlide = userSlideLength - 2;
    }
    userSliderInner.style.setProperty("--sliderCurrent", userCurrenSlide);
    userSliderInner.style.left = -(slideWidth * userCurrenSlide) + '%';
}

// SWIPE SLIDER
var swipeHandler = function() {
    var gesuredZone = document.querySelector('.slider-block');
    var startX;
    var endX;
    var swipeLength;
    gesuredZone.addEventListener('touchstart', function(event) {
        startX = event.touches[0].screenX;
    }, false);
    gesuredZone.addEventListener('touchend', function(event) {
        endX = event.changedTouches[0].screenX;
        swipeLength = Math.abs(startX - endX);
        if (startX > endX & swipeLength > 30) {
            scrollToNext();
        } else if (startX < endX & swipeLength > 30) {
            scrollToPrev();
        }
    }, false);
};
swipeHandler();

// Dropdown menu
var overlay = document.querySelector(".overlay-block");
var dropdownItem = document.querySelectorAll(".dropdown-item");
[].forEach.call(dropdownItem, function (el) {

    el.addEventListener("click", function () {
        var $this = this;
        [].forEach.call(dropdownItem, function (el) {
            if (el !== $this) { el.classList.remove("is-active") }
        });
        el.classList.toggle("is-active");
        overlay.classList.add('is-active');
    });
});

overlay.addEventListener("click", function () {
    this.classList.remove('is-active');
    [].forEach.call(dropdownItem, function (el) {
        return el.classList.remove("is-active");
    });
});

//Toogle mob btn
var mobBtn = document.querySelector(".mobile-btn");
mobBtn.addEventListener("click", function () {
    document.body.classList.toggle("mobile-nav-visible");
});

/* ACCORDION */
var acc = document.getElementsByClassName("accordion-header");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
}