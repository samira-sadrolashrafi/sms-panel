# SMS Panel — Persian SMS Sending System

A responsive Persian RTL SMS sending panel built with **HTML, Tailwind CSS 4, Flowbite, and Vanilla JavaScript**. The interface supports multiple recipients, client-side validation, a custom Jalali (Shamsi) calendar, and optional time scheduling.

## Overview

SMS Panel is a front-end interface designed for Persian-language SMS sending workflows. Users can select a sender, add multiple recipient numbers, write an SMS message, and optionally schedule the message for a future date and time.

All validation and UI behavior run on the client side. No backend, database, or message gateway is connected in this version.

## Features

- Responsive Persian RTL interface
- Vazirmatn font and Persian user-facing text
- Sender selection from a dropdown
- Multiple recipient management with Tagify
- Phone number validation for Iranian mobile numbers (`09xxxxxxxxx`)
- Duplicate recipient detection
- Maximum of 10 recipients per message
- Clear-all recipients action
- Real-time SMS character counter with a 160-character limit
- Custom Jalali (Shamsi) date picker
- Jalali/Gregorian date conversion
- Prevention of selecting dates in the past
- 24-hour time picker powered by Flatpickr
- Prevention of scheduling in the past when today's date is selected
- Optional scheduling section with dynamic show/hide behavior
- Persian validation and feedback messages
- Success toast notification
- Responsive layout for desktop, tablet, and mobile

## Frontend Concepts

The project is implemented with **Vanilla JavaScript (ES6+)** and focuses on practical front-end concepts such as:

- DOM manipulation and event handling
- Client-side form validation
- State management for UI components
- Custom class-based Jalali date picker
- Jalali ↔ Gregorian date conversion
- Persian/Arabic digit normalization
- Event-driven error handling with auto-dismiss timers
- Toast notification state management
- Integration of third-party JavaScript libraries
- Tailwind CSS 4 build workflow

The custom `JalaliDatePicker` class encapsulates calendar navigation, date selection, today/clear actions, and synchronization of the selected Jalali date with a hidden Gregorian-date input.

## Tech Stack

- **HTML5**
- **Tailwind CSS 4** — utility-first styling and build pipeline
- **Flowbite** — UI components and Tailwind plugin
- **Vanilla JavaScript (ES6+)**
- **Tagify** — recipient tag input
- **Flatpickr** — time picker
- **Vazirmatn** — Persian font

## Project Structure

```text
sms-panel/
├── .gitignore
├── .vscode/
│   └── settings.json
├── css/
│   ├── style.css
│   └── tailwind.css
├── js/
│   ├── jalali-datepicker.js
│   └── script.js
├── src/
│   └── input.css
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── safelist.html
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/samira-sadrolashrafi/sms-panel.git
cd sms-panel
```

### 2. Install dependencies

```bash
npm install
```

This installs the project's front-end dependencies, including Tailwind CSS, Flowbite, Tagify, and Flatpickr.

### 3. Build Tailwind CSS during development

```bash
npm run build
```

The current `build` script runs the Tailwind CLI in watch mode and rebuilds `css/tailwind.css` whenever the source files change.

### 4. Open the project

After installing dependencies, open `index.html` in a browser or use a local development server such as VS Code Live Server.

> **Note:** `node_modules/` is intentionally excluded from Git. Because the HTML file loads the libraries from `node_modules/`, running `npm install` is required before opening the project.

## Sending Flow

1. Select a sender number.
2. Add one or more recipient phone numbers.
3. Enter the SMS text and check the live character counter.
4. Enable scheduling when a future delivery time is needed.
5. Select a Jalali date and a 24-hour time.
6. Submit the form.
7. The form is validated on the client side and a success toast is shown when the data is valid.

The current version logs the submission payload to the browser console instead of sending an actual SMS.

## Validation Rules

- At least one valid recipient is required.
- Recipient numbers must start with `09` and contain exactly 11 digits.
- Duplicate recipient numbers are rejected.
- A maximum of 10 recipients can be added.
- The message cannot be empty.
- The message is limited to 160 characters.
- When scheduling is enabled, both date and time are required.
- Past dates cannot be selected.
- When today's date is selected, a past time cannot be scheduled.

## Notes

- This is a **front-end-only** project.
- No backend or database is included.
- Form data is not persisted.
- Successful submissions are currently logged to the browser console.
- The Jalali date picker is implemented as a custom JavaScript class.
- Tailwind CSS 4 is configured with the Flowbite plugin and content sources in `src/input.css`.

## Author

**Samira Sadrolashrafi**

GitHub: https://github.com/samira-sadrolashrafi
