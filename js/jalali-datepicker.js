/**
 * تبدیل جلالی-میلادی بر اساس الگوریتم ۳۳ ساله
 * منبع: jalaali-js (https://github.com/jalaali/jalaali-js)
 * اعتبار: سال‌های ۱۲۰۰ تا ۱۷۰۰ شمسی
 */
(function (global) {
    'use strict';

    var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
        1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

    function div(a, b) { return ~~(a / b); }
    function mod(a, b) { return a - ~~(a / b) * b; }

    function jalCal(jy, withoutLeap) {
        var bl = breaks.length,
            gy = jy + 621,
            leapJ = -14,
            jp = breaks[0],
            jm, jump, leap, leapG, march, n, i;

        if (jy < jp || jy >= breaks[bl - 1]) {
            throw new Error('Invalid Jalaali year ' + jy);
        }

        for (i = 1; i < bl; i += 1) {
            jm = breaks[i];
            jump = jm - jp;
            if (jy < jm) break;
            leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
            jp = jm;
        }
        n = jy - jp;

        leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
        if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

        leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
        march = 20 + leapJ - leapG;

        if (!withoutLeap) {
            if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
            leap = mod(mod(n + 1, 33) - 1, 4);
            if (leap === -1) leap = 4;
        }

        return { leap: leap, gy: gy, march: march };
    }

    function g2d(gy, gm, gd) {
        var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
            + div(153 * mod(gm + 9, 12) + 2, 5)
            + gd - 34840408;
        d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
        return d;
    }

    function d2g(jdn) {
        var j, i, gd, gm, gy;
        j = 4 * jdn + 139361631;
        j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
        i = div(mod(j, 1461), 4) * 5 + 308;
        gd = div(mod(i, 153), 5) + 1;
        gm = mod(div(i, 153), 12) + 1;
        gy = div(j, 1461) - 100100 + div(8 - gm, 6);
        return { gy: gy, gm: gm, gd: gd };
    }

    function j2d(jy, jm, jd) {
        var r = jalCal(jy, true);
        return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
    }

    function d2j(jdn) {
        var gy = d2g(jdn).gy,
            jy = gy - 621,
            r = jalCal(jy, false),
            jdn1f = g2d(gy, 3, r.march),
            jd, jm, k;

        k = jdn - jdn1f;
        if (k >= 0) {
            if (k <= 185) {
                jm = 1 + div(k, 31);
                jd = mod(k, 31) + 1;
                return { jy: jy, jm: jm, jd: jd };
            }
            k -= 186;
        } else {
            jy -= 1;
            k += 179;
            if (r.leap === 1) k += 1;
        }
        jm = 7 + div(k, 30);
        jd = mod(k, 30) + 1;
        return { jy: jy, jm: jm, jd: jd };
    }

    function toJalaali(gy, gm, gd) { return d2j(g2d(gy, gm, gd)); }
    function toGregorian(jy, jm, jd) { return d2g(j2d(jy, jm, jd)); }
    function isLeapJalaaliYear(jy) { return jalCal(jy, false).leap === 0; }

    function jalaaliMonthLength(jy, jm) {
        if (jm <= 6) return 31;
        if (jm <= 11) return 30;
        return isLeapJalaaliYear(jy) ? 30 : 29;
    }

    var MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    var WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

    var MIN_YEAR = 1200;
    var MAX_YEAR = 1700;

    

    function toEnDigits(value) {
        return String(value)
            .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
            .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 1632); });
    }
    function pad2(n) { return n < 10 ? '0' + n : String(n); }
    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function sameDay(a, b) {
        return !!a && !!b &&
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
    }
    function dateToJalali(date) {
        return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
    function jalaliToDate(jy, jm, jd) {
        var g = toGregorian(jy, jm, jd);
        return new Date(g.gy, g.gm - 1, g.gd);
    }
    function formatJalali(date) {
        var j = dateToJalali(date);
        return j.jy + '/' + pad2(j.jm) + '/' + pad2(j.jd);
    }
    function formatGregorian(date) {
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    
    var PANEL = 'jdp hidden absolute bottom-full start-0 mb-2 z-40 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4';
    var HEADER = 'flex items-center justify-between gap-1 mb-2';
    var FOOTER = 'flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-200';
    var WEEKDAYS_ROW = 'grid grid-cols-7 mb-1';
    var GRID_DAYS = 'grid grid-cols-7 gap-0.5';
    var GRID_MONTHS = 'grid grid-cols-3 gap-1.5';

    var CELL = 'flex items-center justify-center h-9 rounded-lg text-sm font-medium text-gray-900 cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300';
    var CELL_SELECTED = 'flex items-center justify-center h-9 rounded-lg text-sm font-semibold bg-blue-700 text-white cursor-pointer transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300';
    var CELL_TODAY = ' ring-1 ring-inset ring-blue-400 text-blue-700';
    var CELL_DISABLED = 'flex items-center justify-center h-9 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed';
    var CELL_WEEKDAY = 'flex items-center justify-center h-9 text-xs font-semibold text-gray-500';
    var CELL_EMPTY = 'h-9';
    var NAV_BTN = 'flex items-center justify-center p-2 text-gray-500 rounded-lg transition-colors hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300';
    var TITLE_BTN = 'flex-1 mx-1 py-2 text-sm font-semibold text-gray-900 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300';
    var FOOT_BTN = 'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2';

    var ICON_PREV = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7"/></svg>';
    var ICON_NEXT = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m15 19-7-7 7-7"/></svg>';

    function JalaliDatePicker(input, options) {
        options = options || {};

        this.input = input;
        this.trigger = options.trigger || null;
        this.hiddenInput = options.hiddenInput || null;
        this.onChange = options.onChange || function () { };
        this.minDate = options.minDate === 'today'
            ? startOfDay(new Date())
            : (options.minDate ? startOfDay(options.minDate) : null);

        this.selectedDate = null;
        this.isOpen = false;
        this.view = 'days';

        var todayJ = dateToJalali(new Date());
        this.viewYear = todayJ.jy;
        this.viewMonth = todayJ.jm;

        this._build();
        this._bind();
        this._render();
    }

    JalaliDatePicker.prototype._build = function () {
        var wrapper = this.input.parentElement;

        if (window.getComputedStyle(wrapper).position === 'static') {
            wrapper.classList.add('relative');
        }

        var el = document.createElement('div');
        el.className = PANEL;
        el.setAttribute('dir', 'rtl');
        el.innerHTML =
            '<div class="' + HEADER + '">'
            + '<button type="button" data-nav="prev" aria-label="ماه قبل" class="' + NAV_BTN + '">' + ICON_PREV + '</button>'
            + '<button type="button" data-role="title" class="' + TITLE_BTN + '"></button>'
            + '<button type="button" data-nav="next" aria-label="ماه بعد" class="' + NAV_BTN + '">' + ICON_NEXT + '</button>'
            + '</div>'
            + '<div class="' + WEEKDAYS_ROW + '" data-role="weekdays"></div>'
            + '<div data-role="grid"></div>'
            + '<div class="' + FOOTER + '">'
            + '<button type="button" data-action="today" class="' + FOOT_BTN + ' text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-300">امروز</button>'
            + '<button type="button" data-action="clear" class="' + FOOT_BTN + ' text-red-600 hover:bg-red-50 focus-visible:ring-red-300">پاک کردن</button>'
            + '</div>';

        wrapper.appendChild(el);

        this.el = el;
        this.titleEl = el.querySelector('[data-role="title"]');
        this.weekdaysEl = el.querySelector('[data-role="weekdays"]');
        this.gridEl = el.querySelector('[data-role="grid"]');
    };

    JalaliDatePicker.prototype._bind = function () {
        var self = this;

        this.input.addEventListener('click', function () { self.toggle(); });

        if (this.trigger) {
            this.trigger.addEventListener('click', function (e) {
                e.preventDefault();
                self.toggle();
            });
        }

        this.el.addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn || btn.disabled) return;
            e.preventDefault();

            if (btn.dataset.nav) {
                self._navigate(btn.dataset.nav === 'next' ? 1 : -1);
            } else if (btn.dataset.role === 'title') {
                self._cycleView();
            } else if (btn.dataset.action === 'today') {
                self.setDate(new Date());
                self.close();
            } else if (btn.dataset.action === 'clear') {
                self.clear();
                self.close();
            } else if (btn.dataset.day) {
                self.setDate(jalaliToDate(self.viewYear, self.viewMonth, +btn.dataset.day));
                self.close();
            } else if (btn.dataset.month) {
                self.viewMonth = +btn.dataset.month;
                self.view = 'days';
                self._render();
            } else if (btn.dataset.year) {
                self.viewYear = +btn.dataset.year;
                self.view = 'months';
                self._render();
            }
        });

        document.addEventListener('click', function (e) {
            if (!self.isOpen) return;
            if (self.el.contains(e.target)) return;
            if (e.target === self.input) return;
            if (self.trigger && self.trigger.contains(e.target)) return;
            self.close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && self.isOpen) self.close();
        });
    };

    JalaliDatePicker.prototype._render = function () {
        if (this.view === 'days') this._renderDays();
        else if (this.view === 'months') this._renderMonths();
        else this._renderYears();
    };

    JalaliDatePicker.prototype._renderDays = function () {
        var today = startOfDay(new Date());

        this.titleEl.textContent = MONTHS[this.viewMonth - 1] + ' ' + this.viewYear;
        this.weekdaysEl.innerHTML = WEEKDAYS.map(function (d) {
            return '<span class="' + CELL_WEEKDAY + '">' + d + '</span>';
        }).join('');

        this.gridEl.className = GRID_DAYS;

        var first = jalaliToDate(this.viewYear, this.viewMonth, 1);
        var offset = (first.getDay() + 1) % 7; 
        var length = jalaaliMonthLength(this.viewYear, this.viewMonth);
        var html = '';
        var i, day, date, disabled, cls;

        for (i = 0; i < offset; i++) {
            html += '<span class="' + CELL_EMPTY + '"></span>';
        }

        for (day = 1; day <= length; day++) {
            date = jalaliToDate(this.viewYear, this.viewMonth, day);
            disabled = this.minDate && date < this.minDate;

            if (disabled) {
                cls = CELL_DISABLED;
            } else if (sameDay(date, this.selectedDate)) {
                cls = CELL_SELECTED;
            } else {
                cls = CELL + (sameDay(date, today) ? CELL_TODAY : '');
            }

            html += '<button type="button" data-day="' + day + '"'
                + (disabled ? ' disabled' : '')
                + ' class="' + cls + '">' + day + '</button>';
        }

        this.gridEl.innerHTML = html;
    };

    JalaliDatePicker.prototype._renderMonths = function () {
        this.titleEl.textContent = String(this.viewYear);
        this.weekdaysEl.innerHTML = '';
        this.gridEl.className = GRID_MONTHS;

        var selected = this.selectedDate ? dateToJalali(this.selectedDate) : null;
        var html = '';
        var m, lastDay, disabled, cls;

        for (m = 1; m <= 12; m++) {
            lastDay = jalaliToDate(this.viewYear, m, jalaaliMonthLength(this.viewYear, m));
            disabled = this.minDate && lastDay < this.minDate;

            if (disabled) cls = CELL_DISABLED;
            else if (selected && selected.jy === this.viewYear && selected.jm === m) cls = CELL_SELECTED;
            else cls = CELL;

            html += '<button type="button" data-month="' + m + '"'
                + (disabled ? ' disabled' : '')
                + ' class="' + cls + '">' + MONTHS[m - 1] + '</button>';
        }

        this.gridEl.innerHTML = html;
    };

    JalaliDatePicker.prototype._renderYears = function () {
        var start = this.viewYear - mod(this.viewYear, 12);

        this.titleEl.textContent = start + ' – ' + (start + 11);
        this.weekdaysEl.innerHTML = '';
        this.gridEl.className = GRID_MONTHS;

        var selected = this.selectedDate ? dateToJalali(this.selectedDate) : null;
        var html = '';
        var i, year, lastDay, disabled, cls;

        for (i = 0; i < 12; i++) {
            year = start + i;
            if (year < MIN_YEAR || year > MAX_YEAR) continue;

            lastDay = jalaliToDate(year, 12, jalaaliMonthLength(year, 12));
            disabled = this.minDate && lastDay < this.minDate;

            if (disabled) cls = CELL_DISABLED;
            else if (selected && selected.jy === year) cls = CELL_SELECTED;
            else cls = CELL;

            html += '<button type="button" data-year="' + year + '"'
                + (disabled ? ' disabled' : '')
                + ' class="' + cls + '">' + year + '</button>';
        }

        this.gridEl.innerHTML = html;
    };

    JalaliDatePicker.prototype._navigate = function (dir) {
        if (this.view === 'days') {
            this.viewMonth += dir;
            if (this.viewMonth > 12) { this.viewMonth = 1; this.viewYear += 1; }
            if (this.viewMonth < 1) { this.viewMonth = 12; this.viewYear -= 1; }
        } else if (this.view === 'months') {
            this.viewYear += dir;
        } else {
            this.viewYear += dir * 12;
        }

        if (this.viewYear < MIN_YEAR) this.viewYear = MIN_YEAR;
        if (this.viewYear > MAX_YEAR) this.viewYear = MAX_YEAR;

        this._render();
    };

    JalaliDatePicker.prototype._cycleView = function () {
        this.view = this.view === 'days' ? 'months' : (this.view === 'months' ? 'years' : 'days');
        this._render();
    };

    JalaliDatePicker.prototype.setDate = function (date, silent) {
        this.selectedDate = startOfDay(date);

        var j = dateToJalali(this.selectedDate);
        this.viewYear = j.jy;
        this.viewMonth = j.jm;
        this.view = 'days';

        this.input.value = formatJalali(this.selectedDate);
        if (this.hiddenInput) this.hiddenInput.value = formatGregorian(this.selectedDate);

        this._render();
        if (!silent) this.onChange(this.selectedDate, this.input.value);
    };

    JalaliDatePicker.prototype.clear = function (silent) {
        this.selectedDate = null;
        this.input.value = '';
        if (this.hiddenInput) this.hiddenInput.value = '';

        var todayJ = dateToJalali(new Date());
        this.viewYear = todayJ.jy;
        this.viewMonth = todayJ.jm;
        this.view = 'days';

        this._render();
        if (!silent) this.onChange(null, '');
    };

    JalaliDatePicker.prototype.open = function () {
        this.view = 'days';
        this._render();
        this.el.classList.remove('hidden');
        this.isOpen = true;
    };

    JalaliDatePicker.prototype.close = function () {
        this.el.classList.add('hidden');
        this.isOpen = false;
    };

    JalaliDatePicker.prototype.toggle = function () {
        if (this.isOpen) this.close();
        else this.open();
    };

    JalaliDatePicker.toJalaali = toJalaali;
    JalaliDatePicker.toGregorian = toGregorian;
    JalaliDatePicker.formatJalali = formatJalali;
    JalaliDatePicker.formatGregorian = formatGregorian;
    JalaliDatePicker.toEnDigits = toEnDigits;

    global.JalaliDatePicker = JalaliDatePicker;

})(window);