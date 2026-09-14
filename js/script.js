// صبر کن تا DOM کامل لود بشه
document.addEventListener('DOMContentLoaded', function() {

    // ===== متغیرها و المان‌ها =====
    const inputElem = document.querySelector('#receiver');
    const receiverError = document.querySelector('#receiver-error');
    const messageInput = document.querySelector('#message');
    const messageCounter = document.querySelector('#message-counter');
    const messageCount = document.querySelector('#message-count');
    const timingCheckbox = document.querySelector('#timing');
    const timingDetail = document.querySelector('#timing-detail');
    const form = document.querySelector('#sms-form');
    const dateInput = document.querySelector('#date');
    const timeInput = document.querySelector('#time');
    const dateError = document.querySelector('#date-error');
    const timeError = document.querySelector('#time-error');
    const messageError = document.querySelector('#message-error');
    const toast = document.querySelector('#toast-success');
    const toastMessage = document.querySelector('#toast-message');
    const toastClose = document.querySelector('.toast-close');
    const clearAllBtn = document.querySelector('#clear-all-tags');
    const dateIconBtn = document.querySelector('#date-icon-btn');
    const timeIconBtn = document.querySelector('#time-icon-btn');
    let timeHasRealValue = false;      // آیا کاربر واقعاً یک ساعت انتخاب کرده؟
    let timeInteractedThisOpen = false; 

    // ===== پیام‌های خطا =====
    const maxTagsMessage = 'حداکثر 10 شماره موبایل می توانید وارد کنید.';
    const invalidPhoneNumber = 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد.';
    const duplicatePhoneNumber = 'شماره موبایل تکراری است.';

    // ===== تایمرها =====
    let errorTimer = null;
    let successTimer = null;

    // ===== Flatpickr - تقویم تاریخ =====
    const datePicker = flatpickr(dateInput, {
        locale: 'fa', // تقویم شمسی
        dateFormat: 'Y-m-d',
        minDate: 'today',
        disableMobile: true,
        clickOpens: true, // کلیک روی خود فیلد تقویم را باز نکند
        onChange: function(selectedDates, dateStr) {
            if (dateStr !== '') {
                clearError(dateError);
            }
            updateTimeMin();
            hideSuccess();
        }
    });

    // ===== Flatpickr - انتخاب ساعت =====
    const timePicker = flatpickr(timeInput, {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true,
    minuteIncrement: 5,
    disableMobile: true,
    clickOpens: true,
    onOpen: function (selectedDates, dateStr, instance) {
        updateTimeMin();

        // فقط ظاهر اسپینر رو به ساعت الان می‌بریم، بدون هیچ "انتخاب" یا نوشتن در فیلد
        const now = new Date();
        instance.set('defaultHour', now.getHours());
        instance.set('defaultMinute', now.getMinutes());
    },
    onChange: function (selectedDates, dateStr) {
        if (dateStr !== '') {
            clearError(timeError);
        }
        hideSuccess();
    }
    });

    // ===== Event Listeners برای آیکون‌ها =====
    dateIconBtn.addEventListener('click', function(e) {
        e.preventDefault();
        datePicker.open();
    });

    timeIconBtn.addEventListener('click', function(e) {
        e.preventDefault();
        timePicker.open();
    });

    // ===== تابع به‌روزرسانی حداقل ساعت =====
    // ===== تابع به‌روزرسانی حداقل ساعت =====
    function updateTimeMin() {
    const selectedDate = datePicker.selectedDates[0];

    if (!selectedDate) {
        timePicker.set('minTime', null);
        return;
    }

    const today = new Date();

    const isSameDay =
        selectedDate.getFullYear() === today.getFullYear() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getDate() === today.getDate();

    if (isSameDay) {
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const currentTime = hours + ':' + minutes;

        timePicker.set('minTime', currentTime);

        if (timePicker.selectedDates.length > 0) {
            const selectedTime = timePicker.selectedDates[0];
            const selectedHours = String(selectedTime.getHours()).padStart(2, '0');
            const selectedMinutes = String(selectedTime.getMinutes()).padStart(2, '0');
            const selectedTimeStr = selectedHours + ':' + selectedMinutes;

            if (selectedTimeStr < currentTime) {
                timePicker.clear();
            }
        }
    } else {
        timePicker.set('minTime', null);
        }  
    }

    // ===== توابع کمکی =====
    // function getTodayString() {
    //     const now = new Date();
    //     const month = String(now.getMonth() + 1).padStart(2, '0');
    //     const day = String(now.getDate()).padStart(2, '0');
    //     return now.getFullYear() + '-' + month + '-' + day;
    // }

    function updateClearAllVisibility() {
        if (tagify.value.length > 0) {
            clearAllBtn.classList.remove('hidden');
        } else {
            clearAllBtn.classList.add('hidden');
        }
    }

    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    function clearError(element) {
        element.textContent = '';
        element.classList.add('hidden');
    }

    function showSuccess(message) {
        toastMessage.textContent = message;
        toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
        toast.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');

        if (successTimer) {
            clearTimeout(successTimer);
        }

        successTimer = setTimeout(() => {
            hideSuccess();
        }, 3000);
    }

    function hideSuccess() {
        toast.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');

        if (successTimer) {
            clearTimeout(successTimer);
            successTimer = null;
        }
    }

    // ===== Event Listeners =====

    // بستن Toast
    toastClose.addEventListener('click', hideSuccess);

    // حذف همه تگ‌ها
    clearAllBtn.addEventListener('click', function () {
        tagify.removeAllTags();
        clearError(receiverError);
        hideSuccess();
        updateClearAllVisibility();
        tagify.DOM.input.focus();
    });

    // ===== Tagify =====
    var tagify = new Tagify(inputElem, {
        maxTags: 10,
        delimiters: ',|;|،',
        keepInvalidTags: false,
        validate: (tagData) => {
            return /^09\d{9}$/.test(tagData.value) ? true : invalidPhoneNumber;
        }
    });

    tagify.on('invalid', function (e) {
        clearTimeout(errorTimer);

        if (e.detail.data && e.detail.data.__isValid === 'already exists') {
            e.detail.message = duplicatePhoneNumber;
        } else if (e.detail.data && e.detail.data.__isValid === 'number of tags exceeded') {
            e.detail.message = maxTagsMessage;
        } else {
            e.detail.message = invalidPhoneNumber;
        }

        showError(receiverError, e.detail.message);

        errorTimer = setTimeout(() => {
            clearError(receiverError);
        }, 3000);
    });

    tagify.on('add', function (e) {
        if (e.detail.data.__isValid === true) {
            clearError(receiverError);
        }
        hideSuccess();
        updateClearAllVisibility();
    });

    tagify.on('remove', function (e) {
        hideSuccess();
        updateClearAllVisibility();
    });

    // ===== شمارنده پیام =====
    messageInput.addEventListener('input', function (e) {
        var currentLength = e.target.value.length;
        messageCount.textContent = currentLength;

        // تغییر رنگ شمارنده
        messageCount.classList.remove('text-green-600', 'text-red-600', 'text-gray-500');

        if (currentLength === 0) {
            messageCount.classList.add('text-gray-500');
        } else if (currentLength === 160) {
            messageCount.classList.add('text-red-600');
        } else {
            messageCount.classList.add('text-green-600');
        }

        if (messageInput.value.trim() !== '') {
            clearError(messageError);
        }

        hideSuccess();
    });

    // ===== زمان‌بندی =====
    timingCheckbox.addEventListener('change', function () {
        if (timingCheckbox.checked) {
            timingDetail.classList.remove('hidden');
            datePicker.set('minDate', 'today');
            updateTimeMin();
        } else {
            timingDetail.classList.add('hidden');
            datePicker.clear();
            timePicker.clear();
            timeHasRealValue = false;
            clearError(dateError);
            clearError(timeError);
        }
        hideSuccess();
    });

    // ===== ارسال فرم =====
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        hideSuccess();

        var receiver = tagify.value.map(tag => tag.value);
        var message = messageInput.value;
        var date = dateInput.value;
        var time = timeInput.value;

        let hasError = false;

        // اعتبارسنجی گیرنده
        if (receiver.length === 0) {
            showError(receiverError, 'لطفاً حداقل یک شماره وارد کنید.');
            hasError = true;
        } else {
            clearError(receiverError);
        }

        // اعتبارسنجی پیام
        if (message.trim() === '') {
            showError(messageError, 'لطفاً متن پیام را وارد کنید.');
            hasError = true;
        } else {
            clearError(messageError);
        }

        // اعتبارسنجی زمان‌بندی
        if (timingCheckbox.checked) {
            if (date === '') {
                showError(dateError, 'لطفاً تاریخ زمان بندی را وارد کنید.');
                hasError = true;
            } else {
                clearError(dateError);
            }

            if (time === '') {
                showError(timeError, 'لطفاً ساعت زمان بندی را وارد کنید.');
                hasError = true;
            } else {
                clearError(timeError);
            }
        }

        if (hasError) return;

        showSuccess("پیامک شما با موفقیت ارسال شد!");
        console.log('داده‌های ارسالی:', { receiver, message, date, time });
    });

    // ===== مقداردهی اولیه =====
    updateClearAllVisibility();

}); // پایان DOMContentLoaded

