/* =========================================================
   GLS CAR WASH V2
   Customer Booking System
   File: js/booking.js
   ========================================================= */

"use strict";


/* =========================================================
   1. PRICING
   ========================================================= */

const NORMAL_WASH_PRICES = {
    "Small Car": 25,
    "Sedan": 28,
    "SUV": 35,
    "MPV": 40,
    "Van": 50
};

const NANO_WASH_EXTRA = 15;


/* =========================================================
   2. PAGE ELEMENTS
   ========================================================= */

const bookingForm =
    document.getElementById("booking-form");

const phoneNumberInput =
    document.getElementById("phoneNumber");

const plateNumberInput =
    document.getElementById("plateNumber");

const customerNameInput =
    document.getElementById("customerName");

const vehicleTypeInput =
    document.getElementById("vehicleType");

const washTypeInput =
    document.getElementById("washType");

const bookingTypeInput =
    document.getElementById("bookingType");

const futureBookingFields =
    document.getElementById("futureBookingFields");

const bookingDateInput =
    document.getElementById("bookingDate");

const bookingTimeInput =
    document.getElementById("bookingTime");

const totalAmountDisplay =
    document.getElementById("totalAmount");

const bookingMessage =
    document.getElementById("bookingMessage");

const continueButton =
    document.getElementById("continueButton");


/* =========================================================
   3. CURRENCY
   ========================================================= */

const currencyFormatter = new Intl.NumberFormat(
    "en-MY",
    {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
);


function formatCurrency(amount) {
    return currencyFormatter.format(
        Number(amount) || 0
    );
}


/* =========================================================
   4. CALCULATE PRICE
   ========================================================= */

function calculatePrice() {

    const vehicleType = vehicleTypeInput.value;
    const washType = washTypeInput.value;

    /*
     * No price shown until both selections
     * have been made.
     */

    if (
        !vehicleType ||
        !washType ||
        !NORMAL_WASH_PRICES[vehicleType]
    ) {

        totalAmountDisplay.textContent =
            formatCurrency(0);

        return 0;
    }


    /*
     * Start with Normal Wash price.
     */

    let amount =
        NORMAL_WASH_PRICES[vehicleType];


    /*
     * Nano Wash costs an additional RM15.
     */

    if (washType === "Nano Wash") {
        amount += NANO_WASH_EXTRA;
    }


    totalAmountDisplay.textContent =
        formatCurrency(amount);

    return amount;
}


/* =========================================================
   5. BOOKING TYPE
   ========================================================= */

function updateBookingType() {

    const futureBooking =
        bookingTypeInput.value === "Future Booking";


    futureBookingFields.hidden = !futureBooking;


    /*
     * Make date/time mandatory only when
     * Future Booking is selected.
     */

    bookingDateInput.required = futureBooking;
    bookingTimeInput.required = futureBooking;


    if (!futureBooking) {

        bookingDateInput.value = "";
        bookingTimeInput.value = "";
    }


    setBookingMessage("");
}


/* =========================================================
   6. MINIMUM BOOKING DATE
   ========================================================= */

function setMinimumBookingDate() {

    /*
     * Generate today's date using the user's
     * local browser date.
     */

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    bookingDateInput.min =
        `${year}-${month}-${day}`;
}


/* =========================================================
   7. NORMALISE PLATE NUMBER
   ========================================================= */

function normalisePlateNumber() {

    let value =
        plateNumberInput.value.toUpperCase();


    /*
     * Remove unnecessary characters while keeping
     * letters, numbers, spaces and hyphens.
     */

    value = value.replace(
        /[^A-Z0-9 -]/g,
        ""
    );


    plateNumberInput.value = value;
}


/* =========================================================
   8. NORMALISE PHONE NUMBER
   ========================================================= */

function normalisePhoneNumber() {

    let value =
        phoneNumberInput.value;


    /*
     * Allow numbers and a leading +.
     */

    value = value.replace(
        /[^\d+]/g,
        ""
    );


    /*
     * Only allow + at the beginning.
     */

    if (value.includes("+")) {

        value =
            "+" +
            value
                .replace(/\+/g, "");
    }


    phoneNumberInput.value = value;
}


/* =========================================================
   9. MESSAGE
   ========================================================= */

function setBookingMessage(
    message,
    type = ""
) {

    if (!bookingMessage) {
        return;
    }


    bookingMessage.textContent = message;

    bookingMessage.className =
        "booking-message";


    if (type) {
        bookingMessage.classList.add(type);
    }
}


/* =========================================================
   10. VALIDATION
   ========================================================= */

function validateBooking() {

    const phone =
        phoneNumberInput.value.trim();

    const plate =
        plateNumberInput.value.trim();

    const vehicleType =
        vehicleTypeInput.value;

    const washType =
        washTypeInput.value;

    const bookingType =
        bookingTypeInput.value;


    if (!phone) {

        setBookingMessage(
            "Please enter your phone number.",
            "error"
        );

        phoneNumberInput.focus();

        return false;
    }


    /*
     * Simple Malaysian-friendly phone validation.
     * Allows local or international-style numbers.
     */

    if (phone.replace(/\D/g, "").length < 9) {

        setBookingMessage(
            "Please enter a valid phone number.",
            "error"
        );

        phoneNumberInput.focus();

        return false;
    }


    if (!plate) {

        setBookingMessage(
            "Please enter your vehicle plate number.",
            "error"
        );

        plateNumberInput.focus();

        return false;
    }


    if (plate.length < 2) {

        setBookingMessage(
            "Please check the vehicle plate number.",
            "error"
        );

        plateNumberInput.focus();

        return false;
    }


    if (!vehicleType) {

        setBookingMessage(
            "Please select your vehicle type.",
            "error"
        );

        vehicleTypeInput.focus();

        return false;
    }


    if (!washType) {

        setBookingMessage(
            "Please select a wash type.",
            "error"
        );

        washTypeInput.focus();

        return false;
    }


    if (
        bookingType === "Future Booking"
    ) {

        if (!bookingDateInput.value) {

            setBookingMessage(
                "Please select your booking date.",
                "error"
            );

            bookingDateInput.focus();

            return false;
        }


        if (!bookingTimeInput.value) {

            setBookingMessage(
                "Please select your booking time.",
                "error"
            );

            bookingTimeInput.focus();

            return false;
        }


        /*
         * Prevent a booking time that has
         * already passed.
         */

        const selectedDateTime =
            new Date(
                `${bookingDateInput.value}T${bookingTimeInput.value}`
            );


        if (
            Number.isNaN(
                selectedDateTime.getTime()
            )
        ) {

            setBookingMessage(
                "Please select a valid booking date and time.",
                "error"
            );

            return false;
        }


        if (
            selectedDateTime.getTime() <=
            Date.now()
        ) {

            setBookingMessage(
                "Please select a future booking time.",
                "error"
            );

            bookingTimeInput.focus();

            return false;
        }
    }


    return true;
}


/* =========================================================
   11. BUILD BOOKING DATA
   ========================================================= */

function buildBookingData() {

    const amount =
        calculatePrice();


    return {

        phone_number:
            phoneNumberInput.value.trim(),

        plate_number:
            plateNumberInput.value
                .trim()
                .toUpperCase(),

        customer_name:
            customerNameInput.value.trim() || null,

        vehicle_type:
            vehicleTypeInput.value,

        wash_type:
            washTypeInput.value,

        amount,

        booking_type:
            bookingTypeInput.value,

        booking_date:
            bookingTypeInput.value === "Future Booking"
                ? bookingDateInput.value
                : null,

        booking_time:
            bookingTypeInput.value === "Future Booking"
                ? bookingTimeInput.value
                : null
    };
}


/* =========================================================
   12. HANDLE FORM SUBMISSION
   ========================================================= */

function handleBookingSubmit(event) {

    event.preventDefault();

    setBookingMessage("");


    if (!validateBooking()) {
        return;
    }


    const booking =
        buildBookingData();


    /*
     * Temporary preview only.
     *
     * In the next development step this
     * will be replaced by Supabase INSERT.
     */

    console.log(
        "GLS Booking Preview:",
        booking
    );


    const bookingDescription =
        booking.booking_type === "Walk-In"
            ? "Walk-In"
            : `${booking.booking_date} at ${booking.booking_time}`;


    setBookingMessage(
        `Ready to continue: ${booking.plate_number} · ` +
        `${booking.vehicle_type} · ` +
        `${booking.wash_type} · ` +
        `${formatCurrency(booking.amount)} · ` +
        `${bookingDescription}`,
        "success"
    );
}


/* =========================================================
   13. EVENT LISTENERS
   ========================================================= */

vehicleTypeInput.addEventListener(
    "change",
    calculatePrice
);


washTypeInput.addEventListener(
    "change",
    calculatePrice
);


bookingTypeInput.addEventListener(
    "change",
    updateBookingType
);


plateNumberInput.addEventListener(
    "input",
    normalisePlateNumber
);


phoneNumberInput.addEventListener(
    "input",
    normalisePhoneNumber
);


bookingForm.addEventListener(
    "submit",
    handleBookingSubmit
);


/* =========================================================
   14. INITIALISE
   ========================================================= */

function initialiseBookingPage() {

    setMinimumBookingDate();

    updateBookingType();

    calculatePrice();

    setBookingMessage("");


    console.log(
        "GLS Car Wash V2 booking page loaded."
    );
}


initialiseBookingPage();
