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