console.log('Script loaded successfully!');

const inputElem = document.querySelector('#receiver');
const receiverError = document.querySelector('#receiver-error');
const messageInput = document.querySelector('#message');
const messageCounter = document.querySelector('#message-counter');
const timingCheckbox = document.querySelector('#timing');
const timingDetail = document.querySelector('#timing-detail');
const form = document.querySelector('form');
const submitBtn = document.querySelector('#submit-btn');
const messageCount = document.querySelector('#message-count')

const messageError = document.querySelector('#message-error');

const dateInput = document.querySelector('#date');
const timeInput = document.querySelector('#time');

const dateError = document.querySelector('#date-error');
const timeError = document.querySelector('#time-error');
const formSuccess = document.querySelector("#form-success");
const smsForm = document.querySelector("#sms-form");

let errorTimer=null;

function showError(elementId, message) {
    elementId.textContent = message;
}

function clearError(elementId) {
    elementId.textContent = '';
}


var tagify = new Tagify(inputElem, {
    maxTags: 10,
    delimiters: ',|;|،',
    keepInvalidTags: false,

    validate: (tagData) => {
        return /^09\d{9}$/.test(tagData.value)
            ? true
            : 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد.';
    }
});

tagify.on('invalid', function(e) {

    clearTimeout(errorTimer);

    showError(receiverError, e.detail.message);

    errorTimer = setTimeout(() => {
        receiverError.textContent = '';
    }, 3000);
});

tagify.on('add', function(e){

    var value = e.detail.data.value;

    if(/^09\d{9}$/.test(value)){

        clearError(receiverError);

    }

    formSuccess.hidden = true;

});

messageInput.addEventListener('input', function(e) {
    var currentLength = e.target.value.length;
    messageCount.textContent = currentLength;

    messageCounter.classList.toggle('is-empty', currentLength === 0);
    messageCounter.classList.toggle('is-full', currentLength === 160);

    if(messageInput.value.trim() !== ''){
        clearError(messageError);
    }

});

timingCheckbox.addEventListener('change', function() {
    timingDetail.hidden = !timingCheckbox.checked;

    if(!timingCheckbox.checked){
        clearError(dateError);
        clearError(timeError);
    }

    formSuccess.hidden=true;
});


form.addEventListener('submit', function(e) {
    e.preventDefault();
    formSuccess.hidden=true;

    var sender = document.querySelector('#sender').value;
    var receiver = tagify.value.map(tag => tag.value);
    var message = messageInput.value;
    var date = document.querySelector('#date').value;
    var time = document.querySelector('#time').value;

    let hasError = false;

    
    if (receiver.length === 0) {
        showError(receiverError, 'لطفاً حداقل یک شماره وارد کنید.');
        hasError=true;
    } else {
        clearError(receiverError);
    }

    if (message.trim() === '') {
        showError(messageError, 'لطفاً متن پیام را وارد کنید.');
        hasError=true;
    } else{
        clearError(messageError);
    }

    if (timingCheckbox.checked) {
        if (date === '') {
            showError(dateError, 'لطفاً تاریخ زمان بندی را وارد کنید.');
            hasError=true;
        } else {
            clearError(dateError);
        }


        if (time === '') {
            showError(timeError, 'لطفاً ساعت زمان بندی را وارد کنید.');
            hasError=true;
        } else{
            clearError(timeError);
        }
    }  

    if(hasError) return;

    formSuccess.hidden=false;

    formSuccess.textContent="پیامک شما با موفقیت ارسال شد!";

    console.log('داده‌های ارسالی:', { sender, receiver, message, date, time });

});

dateInput.addEventListener('input', function() {
    if(dateInput.value !== ''){
        clearError(dateError);
    }
});

timeInput.addEventListener('input', function() {
    if(timeInput.value !== ''){
        clearError(timeError);
    }
});
