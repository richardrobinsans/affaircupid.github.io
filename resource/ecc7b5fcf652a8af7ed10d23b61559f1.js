'use strict';

class Utils {
    isObject(value) {
        return value && typeof value === 'object' && value.constructor === Object;
    }

    mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    }
}

class FormValidator {
    constructor({ form, fields }, props) {
        this.form = form;
        this.props = props;
        this.fields = fields;
        this.errorList = new Set();
    }

    checkAge(name, value) {
        const { messageAge } = this.props;

        value === '' ? this.showMessage(name, messageAge) : this.hideMessages(name);
    }

    checkEmail(name, value) {
        const { messageEmail, regExpEmail } = this.props;
        
        const hasMatch = value.match(regExpEmail);
        hasMatch ? this.hideMessages(name) : this.showMessage(name, messageEmail);
    }

    validate(name) {
        const currentField = this.fields.find((field) => field.name === name);

        if (name === 'email') this.checkEmail(name, currentField.value);
        if (name === 'age') this.checkAge(name, currentField.value);
    }

    showMessage(name, message) {
        const { formErrorContainer, formErrorClass, formItem } = this.props;

        const formItemEl = this.form.querySelector(`[name="${name}"]`).closest(formItem);
        formItemEl.classList.add(formErrorClass);

        const formErrorEl = formItemEl.querySelector(formErrorContainer);
        formErrorEl.innerHTML = `<p>${message}</p>`;

        this.errorList.add(name);
    }

    hideMessages(name) {
        const { formErrorContainer, formErrorClass, formItem } = this.props;

        const formItemEl = this.form.querySelector(`[name="${name}"]`).closest(formItem);
        formItemEl.classList.remove(formErrorClass);

        const formErrorEl = formItemEl.querySelector(formErrorContainer);
        formErrorEl.innerHTML = '';

        this.errorList.delete(name);
    }
}

class MultiStep {
    constructor(validator, { form, fields, props }) {
        this.validator = validator;
        this.form = form;
        this.fields = fields;
        this.props = props;

        this.init();
    }

    init() {
        const { stepContainer, formControls, pagination, activeClass } = this.props;

        this.stepsList = this.form.querySelectorAll(stepContainer);

        this.maxStep = this.stepsList.length;
        this.currentStep = Array.from(this.stepsList).find((step) => step.classList.contains(activeClass));
        this.currentStepIndex = !this.currentStep ? 0 : Array.from(this.stepsList).findIndex((step) => step.classList.contains(activeClass));
        this.setCurrentStepData(this.currentStepIndex);

        this.nextBtn = this.form.querySelector(formControls.nextElement);
        this.prevBtn = this.form.querySelector(formControls.prevElement);

        if (pagination.exist) {
            this.initPagination();
        }

        this.setEvents();
    }

    setEvents() {
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
    }

    setCurrentStepData(index) {
        this.stepsList[index].classList.add(this.props.activeClass);
        this.currentStep = this.stepsList[index];
        document.body.dataset.currentStepIndex = index + 1;
        document.body.dataset.currentStepName = this.currentStep.dataset.stepName;
    }

    getStepNodes(index) {
        const step = this.stepsList[index];
        if (!step) {
            return;
        }

        return Array.from(step.querySelector(this.props.validator.formItem).querySelectorAll(`[name]`)).map((node) => node.name);
    }

    getCurrentStepFields(index) {
        const currentStepNodes = this.getStepNodes(index);

        return this.fields.filter((field) => currentStepNodes.includes(field.name));
    }

    getPrevStepFields(index) {
        const prevStepNodes = this.getStepNodes(index - 1);
        if (!prevStepNodes) return null;

        return this.fields.filter((field) => prevStepNodes.includes(field.fieldName));
    }

    getNextStepFields(index) {
        const nextStepNodes = this.getStepNodes(index + 1);
        if (!nextStepNodes) return null;

        return this.fields.filter((field) => nextStepNodes.includes(field.fieldName));
    }

    showNextStep() {
        if (this.currentStepIndex < this.stepsList.length - 1) {
            this.currentStepIndex++;
            this.stepBy(this.currentStepIndex);
            this.dispatchMultistepEvent('step-next');
        }
    }

    next() {
        const currentStepFields = this.getCurrentStepFields(this.currentStepIndex);
        
        if (currentStepFields.length) {
            currentStepFields.forEach(step => this.validator.validate(step.name));

            if (!this.validator.errorList.size) this.showNextStep();
        } else {
            this.showNextStep();
        }
    }

    prev() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.stepBy(this.currentStepIndex);
            this.dispatchMultistepEvent('step-prev');
        }
    }

    stepBy(index) {
        this.currentStep.classList.remove(this.props.activeClass);
        this.setCurrentStepData(index);
    }

    dispatchMultistepEvent(name = 'step-change') {
        const event = new CustomEvent(name, {
            detail: {
                maxStep: this.maxStep,
                currentStep: this.currentStep,
                currentStepIndex: this.currentStepIndex,
                currentStepFields: this.getCurrentStepFields(this.currentStepIndex),
                prevStepFields: this.getPrevStepFields(this.currentStepIndex),
                nextStepFields: this.getNextStepFields(this.currentStepIndex),
            },
        });
        this.form.dispatchEvent(event);
    }

    initPagination() {
        const { container, item } = this.props.pagination;

        let items = `<div class="${container}">`;
        for (let i = 1; i <= this.maxStep; i++) {
            items += `<div class="${item}" data-pagination-index="${i}"><span>${i}</span></div>`;
        }
        items += '</div>';

        this.form.insertAdjacentHTML('beforeend', items);
        this.paginationContainer = document.querySelector(`.${container}`);
        this.paginations = [...this.paginationContainer.children];
        this.updatePagination(0);

        this.form.addEventListener('step-next', (e) => this.updatePagination(e.detail.currentStepIndex));
        this.form.addEventListener('step-prev', (e) => this.updatePagination(e.detail.currentStepIndex));
    }
    updatePagination(i) {
        const { currentClass, visitedClass } = this.props.pagination;

        this.paginations.forEach((el) => {
            el.classList.remove(currentClass);
            el.classList.remove(visitedClass);
        });
        this.paginations
            .filter((el, index) => index <= i)
            .forEach((el) => {
                el.classList.add(visitedClass);
            });
        this.paginationContainer.children[i].classList.remove(visitedClass);
        this.paginationContainer.children[i].classList.add(currentClass);
    }
}

class FormTDS extends Utils {
    constructor(form, options = {}) {
        super();
        this.form = form;
        this.props = this.initProps(options);
        this.state = this.initState(this.form);

        this.validator = new FormValidator(this.state, this.props.validator);

        if (this.props.hasMultiSteps) {
            this.multiStep = new MultiStep(this.validator, this.state);
        }

        this.props.genderBtns.exist ? this.initGenderBtns() : this.initGenderSelect();

        this.setOrientation(this.props.gender, this.props.orientation);

        this.setEvents();
    }

    initProps(options) {
        const defaults = {
            hasMultiSteps: false,
            stepContainer: '.form-step-item',
            activeClass: 'is-active',
            gender: 'male',
            orientation: 'hetero',
            formControls: {
                submitElement: '.submit-btn',
                nextElement: '.next-btn',
                prevElement: '.prev-btn',
            },
            genderBtns: {
                exist: false,
                activeClass: 'is-active',
                genderAttr: '[data-gender]',
                partnerGenderAttr: '[data-partner-gender]',
            },
            pagination: {
                exist: false,
                root: this.form,
                container: 'pagination-block',
                item: 'pagination-item',
                currentClass: 'is-current',
                visitedClass: 'is-visited',
            },
            fields: [
                { name: 'gender', value: 'male', required: false },
                { name: 'sexual_orientation', value: 'hetero', required: false },
                { name: 'age', element: null, value: '', required: true },
                { name: 'email', element: null, value: '', required: true },
            ],
            validator: {
                formItem: '.form-item',
                formErrorContainer: '.form-error-block',
                formErrorClass: 'error-field',
                messageAge: 'Please select your age',
                messageEmail: 'Please enter a valid email address',
                regExpEmail: /^([A-Za-z0-9\+\._\-])+\@([A-Za-z0-9\-\.\_])+(\.[A-Za-z]{2,20})$/,
            },
        };

        return this.mergeDeep(defaults, options);
    }

    initState(form) {
        const props = this.props;
        const fields = this.setFields();
        
        return {
            props,
            form,
            fields,
        };
    }

    setFields() {
        const { fields } = this.props;

        return fields.map((field) => {
            let element;
            if(field.required) element = this.form.querySelector(`[name="${field.name}"]`);
            return { name: field.name, element, value: '' };
        });
    }

    getFieldByName(name) {
        return this.state.fields.find((field) => field.name === name);
    }

    updateFieldRequiredValue(name) {
        const finded = this.getFieldByName(name);
        finded.value = finded.element.value;
        
        this.props.fields.find(field => field.name === name).value = finded.element.value;
    }

    prepareFData(e) {
        const fData = this.state.fields.reduce((acc, field) => {
            acc[field.name] = field.value;
      
            return acc;
        }, {});

        const currentHref = e.currentTarget.getAttribute('data-href');
        const fDataHref = '&_fData=' + encodeURIComponent(btoa(JSON.stringify(fData)));

        return currentHref + fDataHref;
    }

    setEvents() {
        const { fields } = this.state;
        const fieldsRequired = fields.filter(field => field.element !== undefined);

        const inputs = fieldsRequired.filter((input) => input.element.tagName === 'INPUT');
        const selects = fieldsRequired.filter((select) => select.element.tagName === 'SELECT');

        inputs.forEach((input) => {
            input.element.addEventListener('blur', (e) => {
                this.updateFieldRequiredValue(e.target.name);
                this.validator.validate(e.target.name);
            });
        });

        selects.forEach((select) => {
            select.element.addEventListener('change', (e) => {
                this.updateFieldRequiredValue(e.target.name);
                this.validator.validate(e.target.name);
            });
        });

        const submitBtn = this.form.querySelector(this.props.formControls.submitElement);
        submitBtn.addEventListener('click', (e) => {
          fields.forEach(field => this.validator.validate(field.name));
          
          if (!this.validator.errorList.size) window.location.href = this.prepareFData(e);
        });
    }

    initGenderBtns() {
        const { activeClass, genderAttr, partnerGenderAttr } = this.props.genderBtns;
        const { gender, orientation } = this.props;
        const genderBtns = this.form.querySelectorAll(genderAttr);
        const partnerGenderBtns = this.form.querySelectorAll(partnerGenderAttr);

        const triggerActiveClass = (currentTarget, btns) => {
            this.form.querySelectorAll(btns).forEach((btn) => btn.classList.remove(activeClass));
            currentTarget.classList.add(activeClass);
        };

        const triggerPartnerGenderBtn = (gender) => {
            partnerGenderBtns.forEach((btn) => {
              if(orientation === 'hetero') {
                btn.dataset.partnerGender === gender ? btn.classList.remove(activeClass) : btn.classList.add(activeClass);
              }
              else{
                btn.dataset.partnerGender === gender ? btn.classList.add(activeClass) : btn.classList.remove(activeClass);
              }
            });
        };

        // Set default active Gender btn
        const defaultGender = Array.from(genderBtns).find((btn) => btn.dataset.gender === gender);
        defaultGender.classList.add(activeClass);

        // Set default active PartnerGender btn
        triggerPartnerGenderBtn(gender);

        genderBtns.forEach((btn) => {
            btn.addEventListener('click', ({ currentTarget }) => {
                triggerActiveClass(currentTarget, genderAttr);
                this.setOrientation(currentTarget.dataset.gender, 'hetero');
                triggerPartnerGenderBtn(currentTarget.dataset.gender);
            });
        });

        partnerGenderBtns.forEach((btn) => {
            btn.addEventListener('click', ({ currentTarget }) => {
                const currentGender = Array.from(genderBtns).find((btn) => btn.classList.contains(activeClass));
                triggerActiveClass(currentTarget, partnerGenderAttr);
                this.changeOrientation(currentGender.dataset.gender, currentTarget.dataset.partnerGender);
            });
        });
    }

    initGenderSelect() {
        const { gender, orientation } = this.props;
        const orientationField = this.form.querySelector('[name="sexual_orientation"]');

        orientationField.querySelector(`option[value="${orientation}"][data-gender-value="${gender}"]`).selected = true;

        orientationField.addEventListener('change', ({ target }) => {
            target.dataset.genderSelected = target.selectedOptions[0].dataset.genderValue;
            this.setOrientation(target.dataset.genderSelected, target.value);
        });
    }

    updateOrientation(gender, orientation) {
        const { fields } = this.state;

        fields.find((field) => field.name === 'gender').value = gender;
        fields.find((field) => field.name === 'sexual_orientation').value = orientation;
    }

    changeOrientation(gender, partnerGender) {
        if (`${gender}-${partnerGender}` === 'male-female') this.setOrientation('male', 'hetero');
        if (`${gender}-${partnerGender}` === 'male-male') this.setOrientation('male', 'homo');
        if (`${gender}-${partnerGender}` === 'female-male') this.setOrientation('female', 'hetero');
        if (`${gender}-${partnerGender}` === 'female-female') this.setOrientation('female', 'homo');
    }

    setOrientation(gender, orientation) {
        document.body.dataset.orientation = `${orientation}-${gender}`;

        this.updateOrientation(gender, orientation);
    }
}

class FieldEvents {
    constructor(root = ['.form-item'], options = {}) {
        this.fields = this.setFields(root);
        this.props = this.initProps(options);

        this.setEvents();
    }

    initProps(options) {
        const defaults = {
            fieldContainer: '.form-item',
            activeClass: 'is-visible',
            focusClass: 'is-focused',
            select: {
                selectContainer: '.form-select',
                selectedValue: 'select-value',
                selectDropdown: 'select-dropdown',
                selectDropdownItem: 'select-item',
            },
        };

        return Object.assign({}, defaults, options);
    }

    setFields(root) {
        const fields = root.reduce((acc, parent) => {
            document.querySelectorAll(parent).forEach((item) => {
                item.querySelectorAll('input, select').forEach((el) => acc.push(el));
            });

            return acc;
        }, []);

        return fields;
    }

    setEvents() {
        const { activeClass,
            select: { selectContainer, selectedValue, selectDropdownItem },
        } = this.props;
        

        const inputs = this.fields.filter((input) => input.tagName === 'INPUT');
        const selects = this.fields.filter((select) => select.tagName === 'SELECT');

        // Input change
        inputs.forEach((input) => {
            input.value ? this.addFocus(input) : this.removeFocus(input);

            input.addEventListener('focus', (e) => this.addFocus(e.currentTarget));
            input.addEventListener('blur', ({ currentTarget }) => {
                currentTarget.value ? this.addFocus(currentTarget) : this.removeFocus(currentTarget);
            });
        });

        selects && this.renderCustomSelects(selects);
        // Selects change
        let openedSelectedValue;
        selects &&
            selects.forEach((select) => {
                const parent = select.closest(selectContainer);
                const selected = parent.querySelector(`.${selectedValue}`);

                select.addEventListener('change', ({ currentTarget }) => {
                    selected.textContent = currentTarget[currentTarget.selectedIndex].innerText;
                });
                // show/hide dropdown
                selected.addEventListener('click', (e) => {
                    const openedSelect = document.querySelector(`.${this.props.activeClass}`);
                    openedSelectedValue = openedSelect && openedSelect.querySelector(`.${selectedValue}`);
                    if (openedSelect && openedSelectedValue !== e.currentTarget) {
                        openedSelect.classList.remove(this.props.activeClass);
                    }

                    parent.classList.toggle(activeClass);

                    e.stopPropagation();
                });

                // select-item click
                parent.querySelectorAll(`.${selectDropdownItem}`).forEach((item) => {
                    item.addEventListener('click', ({ currentTarget }) => {
                        const gender = currentTarget.dataset.genderValue;
                        const value = currentTarget.getAttribute('value');
                        selected.textContent = currentTarget.textContent;
                        select.value = value;

                        if (gender) {
                            select.dataset.genderSelected = gender;
                            select.querySelector(`option[value="${value}"][data-gender-value="${gender}"]`).selected = true;
                        }

                        parent.classList.remove(activeClass);
                        this.addFocus(currentTarget);

                        select.dispatchEvent(new Event('change'));
                    });
                });
            });

        // Close opened selects
        document.addEventListener('click', (e) => {
            if (e.target !== openedSelectedValue) {
                const openedSelect = document.querySelector(`.${this.props.activeClass}`);
                if (openedSelect) {
                    openedSelect.classList.remove(this.props.activeClass);
                }
            }
        });
    }

    addFocus(el) {
        const { fieldContainer, focusClass } = this.props;

        el.closest(fieldContainer).classList.add(focusClass);
    }

    removeFocus(el) {
        const { fieldContainer, focusClass } = this.props;

        el.closest(fieldContainer).classList.remove(focusClass);
    }

    renderCustomSelects(selects) {
        const { selectContainer, selectedValue, selectDropdown, selectDropdownItem } = this.props.select;

        selects.forEach((select) => {
            const dropdown = document.createElement('div');
            dropdown.className = selectDropdown;
            const selected = document.createElement('div');
            selected.className = selectedValue;

            select.querySelectorAll('option').forEach((option) => {
                if (option.selected) {
                    selected.textContent = option.textContent;
                    this.addFocus(select);
                }

                let clone = `<div class="${selectDropdownItem}" value="${option.value}">${option.textContent}</div>`;
                if (option.dataset.genderValue) {
                    clone = `<div class="${selectDropdownItem}" value="${option.value}" data-gender-value="${option.dataset.genderValue}">${option.textContent}</div>`;
                }

                dropdown.insertAdjacentHTML('beforeend', clone);
            });

            select.closest(selectContainer).appendChild(selected);
            select.closest(selectContainer).appendChild(dropdown);
        });
    }
}

const formContainer = document.querySelector('.reg-form');
const tdsForm = new FormTDS(formContainer, {
  hasMultiSteps: true,
  pagination: {exist: true}
});
new FieldEvents();