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

const filterItemBtn = document.querySelectorAll('.filter-item');
const filterAllBtn = document.querySelector('.filter-all');
const articlesItem = document.querySelectorAll('.article-item');

filterAllBtn.addEventListener('click', () => {
    if (filterAllBtn.classList.contains('is-active')) {
      articlesItem.forEach((el) => el.classList.remove('is-active'));
    }
    filterAllBtn.classList.toggle('is-active');
    filterItemBtn.forEach((btn) => btn.classList.remove('is-active'));

    visibleArticles();
});

filterItemBtn.forEach((btn) => {
    btn.addEventListener('click', function () {
        if (filterAllBtn.classList.contains('is-active')) {
            articlesItem.forEach((el) => el.classList.remove('is-active'));
        }
        filterAllBtn.classList.remove('is-active');
        document.querySelectorAll(`[data-filter="${this.dataset.filter}"]`).forEach((el) => el.classList.toggle('is-active'));
    });
});

const visibleArticles = () => {
    if (filterAllBtn.classList.contains('is-active')) {
        articlesItem.forEach((item) => {
            if (item.querySelectorAll('.article-inner a').length) {
                item.classList.add('is-active');
            }
        });
    }
};

visibleArticles();