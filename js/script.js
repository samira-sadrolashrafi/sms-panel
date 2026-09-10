console.log('Script loaded successfully!');

var inputElem = document.querySelector('#receiver');
var receiverError = document.querySelector('#receiver-error');
var messageInput = document.querySelector('#message');
var messageCounter = document.querySelector('#message-counter');
var timingCheckbox = document.querySelector('#timing');
var timingDetail = document.querySelector('.timing_detail');
var form = document.querySelector('form');
var submitBtn = document.querySelector('#submit-btn');
var formError=document.querySelector('#form-error');

var senderError = document.querySelector('#sender-error');
var messageError = document.querySelector('#message-error');

var dateInput = document.querySelector('#date');
var timeInput = document.querySelector('#time');

var dateError = document.querySelector('#date-error');
var timeError = document.querySelector('#time-error');

var errorTimer;

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
            : 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد';
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

});

messageInput.addEventListener('input', function(e) {
    var currentLength = e.target.value.length;
    messageCounter.textContent = `${currentLength} / 160`;

    if(messageInput.value.trim() !== ''){
        clearError(messageError);
    }

});

timingCheckbox.addEventListener('change', function() {
    if (timingCheckbox.checked) {
        timingDetail.style.display = 'block';
    } else {
        timingDetail.style.display = 'none';
    }

    
});


form.addEventListener('submit', function(e) {
    e.preventDefault();

    var sender = document.querySelector('#sender').value;
    var receiver = tagify.value.map(tag => tag.value);
    var message = messageInput.value;
    var date = document.querySelector('#date').value;
    var time = document.querySelector('#time').value;

    // clearError(receiverError);
    // clearError(messageError);
    // clearError(timingError);

    
    if (receiver.length === 0) {
        showError(receiverError, 'لطفاً حداقل یک شماره وارد کنید.');
        return;
    } else {
        clearError(receiverError);
    }

    if (message.trim() === '') {
        showError(messageError, 'لطفاً متن پیام را وارد کنید.');
        return;
    }

    if (timingCheckbox.checked) {
        if (date === '') {
            showError(dateError, 'لطفاً تاریخ زمان بندی را وارد کنید.');
            return;
        } else if (time === '') {
            showError(timeError, 'لطفاً ساعت زمان بندی را وارد کنید.');
            return;
        }
    }  
});

dateInput.addEventListener('change', function() {
    if(dateInput.value !== ''){
        clearError(dateError);
    }
});

timeInput.addEventListener('change', function() {
    if(timeInput.value !== ''){
        clearError(timeError);
    }
});
