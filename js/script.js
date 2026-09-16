// صبر کن تا DOM کامل لود بشه
document.addEventListener('DOMContentLoaded', function () {

    // ===== متغیرها و المان‌ها =====
    const inputElem = document.querySelector('#receiver');
    const receiverError = document.querySelector('#receiver-error');
    const messageInput = document.querySelector('#message');
    const messageCount = document.querySelector('#message-count');
    const timingCheckbox = document.querySelector('#timing');
    const timingDetail = document.querySelector('#timing-detail');
    const form = document.querySelector('#sms-form');
    const dateInput = document.querySelector('#date');
    const dateGregorianInput = document.querySelector('#date-gregorian');
    const timeInput = document.querySelector('#time');
    const timeLatinInput = document.querySelector('#time-latin');
    const dateError = document.querySelector('#date-error');
    const timeError = document.querySelector('#time-error');
    const messageError = document.querySelector('#message-error');
    const toast = document.querySelector('#toast-success');
    const toastMessage = document.querySelector('#toast-message');
    const toastClose = document.querySelector('.toast-close');
    const clearAllBtn = document.querySelector('#clear-all-tags');
    const dateIconBtn = document.querySelector('#date-icon-btn');
    const timeIconBtn = document.querySelector('#time-icon-btn');
    const timingRow = document.querySelector('#timing-row');
    let timeInteractedThisOpen = false;

    // ===== پیام‌های خطا =====
    const maxTagsMessage = 'حداکثر 10 شماره موبایل می توانید وارد کنید.';
    const invalidPhoneNumber = 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد.';
    const duplicatePhoneNumber = 'شماره موبایل تکراری است.';

    // ===== تایمرهای خطا =====
    let receiverErrorTimer = null;
    let timeErrorTimer = null;
    let successTimer = null;

    // ===== توابع کمکی خطا =====
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    function clearError(element) {
        element.textContent = '';
        element.classList.add('hidden');
    }

    /**
     * نمایش خطای ساعت برای ۳ ثانیه.
     * تا وقتی timeErrorTimer پر است، خطا «قفل» محسوب می‌شود و
     * هیچ رویداد جانبی (مثل onChange خود flatpickr) اجازه‌ی پاک کردنش را ندارد.
     */
    function showTimeError(message) {
        clearTimeout(timeErrorTimer);
        showError(timeError, message);

        timeErrorTimer = setTimeout(function () {
            timeErrorTimer = null;
            clearError(timeError);
        }, 3000);
    }

    function isTimeErrorLocked() {
        return timeErrorTimer !== null;
    }

    function resetTimeError() {
        clearTimeout(timeErrorTimer);
        timeErrorTimer = null;
        clearError(timeError);
    }

    function showSuccess(message) {
        toastMessage.textContent = message;
        toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
        toast.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');

        if (successTimer) {
            clearTimeout(successTimer);
        }

        successTimer = setTimeout(function () {
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

    // ===== تقویم شمسی (JalaliDatePicker) =====
    // مقدار نمایشی: شمسی | مقدار ارسالی: میلادی در #date-gregorian
    const datePicker = new JalaliDatePicker(dateInput, {
        trigger: dateIconBtn,
        hiddenInput: dateGregorianInput,
        minDate: 'today',
        onChange: function (selectedDate, dateStr) {
            if (dateStr !== '') {
                clearError(dateError);
            }
            updateTimeMin();
            hideSuccess();
        }
    });

    // ===== ارقام فارسی =====
    const enDigits = JalaliDatePicker.toEnDigits;

    // مقدار لاتین ساعت را برای ارسال به سرور همگام نگه می‌دارد
    function syncTimeLatin() {
        if (timeLatinInput) timeLatinInput.value = enDigits(timeInput.value);
    }

    /**
     * فیلدهای ساعت/دقیقه‌ی flatpickr را فارسی‌نویس می‌کند.
     * getter مقدار را لاتین برمی‌گرداند (تا منطق داخلی flatpickr سالم بماند)
     * و setter مقدار را فارسی می‌نویسد (چیزی که کاربر می‌بیند).
     */
    function configureTimeSpinnerInput(input) {
        input.type = 'text';
        input.setAttribute('inputmode', 'numeric');
    }



    // ===== Flatpickr - انتخاب ساعت =====
    const timePicker = flatpickr(timeInput, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        minuteIncrement: 1,
        disableMobile: true,
        clickOpens: true,
        // خروجی فیلد ساعت با ارقام فارسی نوشته می‌شود
        parseDate: function (dateStr, format) {
            return flatpickr.parseDate(enDigits(dateStr), format);
        },

        onOpen: function (selectedDates, dateStr, instance) {
            updateTimeMin();
            timeInteractedThisOpen = false; // ریست فلگ تعامل برای این بار باز شدن

            const selectedDate = datePicker.selectedDate;
            const today = new Date();
            const isToday = selectedDate &&
                selectedDate.getFullYear() === today.getFullYear() &&
                selectedDate.getMonth() === today.getMonth() &&
                selectedDate.getDate() === today.getDate();

            if (isToday) {
                // فقط برای «امروز»: ظاهر اسپینر رو به ساعت الان می‌بریم
                instance.hourElement.value = String(today.getHours()).padStart(2, '0');
                instance.minuteElement.value = String(today.getMinutes()).padStart(2, '0');
            } else {
                resetTimeSpinners(instance);
            }
        },
        onClose: function (selectedDates, dateStr, instance) {
            // اگر کاربر واقعاً چیزی تغییر نداده بود، همه چیز رو پاک کن
            if (!timeInteractedThisOpen) {
                instance.clear();
                resetTimeSpinners(instance);
            }
            syncTimeLatin();
        },
        onChange: function (selectedDates, dateStr) {
            // خطای ساعت فقط وقتی پاک می‌شود که در حال حاضر «قفل» نباشد.
            // (flatpickr هنگام بسته شدن، روی blur یک‌بار مقدار را commit و onChange را شلیک می‌کند
            //  و بدون این شرط، خطای تازه‌نمایش‌داده‌شده بلافاصله پاک می‌شد.)
            if (dateStr !== '' && !isTimeErrorLocked()) {
                clearError(timeError);
            }
            syncTimeLatin();
            hideSuccess();
        }
    });

    // فارسی‌سازی ارقام اسپینر ساعت و دقیقه
    configureTimeSpinnerInput(timePicker.hourElement);
    configureTimeSpinnerInput(timePicker.minuteElement);

    function resetTimeSpinners(instance) {
        instance.hourElement.value = String(instance.config.defaultHour).padStart(2, '0');
        instance.minuteElement.value = String(instance.config.defaultMinute).padStart(2, '0');
    }

    // ===== کنترل ورودی ساعت و دقیقه (حداکثر ۲ رقم + محدوده مجاز) =====
    function limitTimeInput(input, maxValue, instance) {

        input.setAttribute('min', '0');
        input.setAttribute('max', String(maxValue));
        input.setAttribute('step', '1');

        // جلوگیری از کاراکترهای غیرمجاز
        input.addEventListener('keydown', function (e) {
            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // کنترل مقدار هنگام تایپ یا Paste
        input.addEventListener('input', function () {

            timeInteractedThisOpen = true;

            // فقط عدد
            let value = input.value.replace(/\D/g, '');

            // حداکثر دو رقم
            if (value.length > 2) {
                value = value.slice(0, 2);
            }

            // اگر مقدار از حد مجاز بیشتر بود
            if (value !== '' && Number(value) > maxValue) {
                showTimeError('زمان وارد شده صحیح نیست.');

                input.value = '';
                instance.close(); // پنجره رو ببند تا پیام خطا دیده بشه

                // بعد از بسته شدن، هر مقداری که flatpickr روی blur commit کرده را دور می‌ریزیم
                setTimeout(function () {
                    instance.clear();
                    resetTimeSpinners(instance);
                }, 0);
                return;
            }

            input.value = value;
        });

        input.addEventListener('change', function () {
            timeInteractedThisOpen = true;
        });

        input.addEventListener('wheel', function () {
            timeInteractedThisOpen = true;
        });
    }

    // ساعت فقط از 00 تا 23
    limitTimeInput(timePicker.hourElement, 23, timePicker);

    // دقیقه فقط از 00 تا 59
    limitTimeInput(timePicker.minuteElement, 59, timePicker);

    // ===== باز کردن انتخاب ساعت با آیکون =====
    timeIconBtn.addEventListener('click', function (e) {
        e.preventDefault();
        timePicker.open();
    });

    // ===== تابع به‌روزرسانی حداقل ساعت =====
    function updateTimeMin() {
        const selectedDate = datePicker.selectedDate;

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

    // ===== Tagify =====
    function updateClearAllVisibility() {
        if (tagify.value.length > 0) {
            clearAllBtn.classList.remove('hidden');
        } else {
            clearAllBtn.classList.add('hidden');
        }
    }

    var tagify = new Tagify(inputElem, {
        maxTags: 10,
        delimiters: ',|;|،',
        keepInvalidTags: false,
        validate: (tagData) => {
            return /^09\d{9}$/.test(tagData.value) ? true : invalidPhoneNumber;
        }
    });

    tagify.on('invalid', function (e) {
        clearTimeout(receiverErrorTimer);

        if (e.detail.data && e.detail.data.__isValid === 'already exists') {
            e.detail.message = duplicatePhoneNumber;
        } else if (e.detail.data && e.detail.data.__isValid === 'number of tags exceeded') {
            e.detail.message = maxTagsMessage;
        } else {
            e.detail.message = invalidPhoneNumber;
        }

        showError(receiverError, e.detail.message);

        receiverErrorTimer = setTimeout(function () {
            clearError(receiverError);
        }, 3000);
    });

    tagify.on('add', function (e) {
        if (e.detail.data.__isValid === true) {
            clearTimeout(receiverErrorTimer);
            clearError(receiverError);
        }
        hideSuccess();
        updateClearAllVisibility();
    });

    tagify.on('remove', function () {
        hideSuccess();
        updateClearAllVisibility();
    });

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
            updateTimeMin();
        } else {
            timingDetail.classList.add('hidden');
            datePicker.clear(true); // بدون شلیک onChange
            datePicker.close();
            timePicker.clear();
            resetTimeError();
            clearError(dateError);
        }
        hideSuccess();
    });

    // کلیک روی کل ردیف «زمان‌بندی ارسال»، سوییچ را toggle کند
    timingRow.addEventListener('click', function (e) {
        // اگر کلیک دقیقاً روی خودِ لیبل متن یا لیبل سوییچ بود،
        // بگذار خودشان طبق رفتار native مدیریتش کنند (وگرنه دوبار toggle می‌شود)
        if (e.target.closest('label')) return;

        timingCheckbox.click();
    });

    // ===== ارسال فرم =====
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        hideSuccess();

        var receiver = tagify.value.map(tag => tag.value);
        var message = messageInput.value;
        var date = dateInput.value;                    // شمسی (نمایشی)
        var dateGregorian = dateGregorianInput.value;  // میلادی (برای سرور)
        var time = timeInput.value;                    // فارسی (نمایشی)
        syncTimeLatin();
        var timeLatin = timeLatinInput ? timeLatinInput.value : enDigits(time); // برای سرور

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
                resetTimeError(); // لغو تایمر ۳ ثانیه‌ای تا این خطا ماندگار بماند
                showError(timeError, 'لطفاً ساعت زمان بندی را وارد کنید.');
                hasError = true;
            } else {
                resetTimeError();
            }
        }

        if (hasError) return;

        showSuccess('پیامک شما با موفقیت ارسال شد!');
        console.log('داده‌های ارسالی:', { receiver, message, date, dateGregorian, time, timeLatin });
    });

    // ===== مقداردهی اولیه =====
    updateClearAllVisibility();

}); // پایان DOMContentLoaded