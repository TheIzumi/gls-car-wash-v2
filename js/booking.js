/* =========================================================
   GLS CAR WASH V2
   Customer QR Booking System
   File: js/booking.js
   ========================================================= */

"use strict";


/* =========================================================
   1. SUPABASE CONFIGURATION
   ========================================================= */

const GLS_SUPABASE_URL =
    "https://nfzlsjcrhaxvftpnokah.supabase.co";

const GLS_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_WJtd9t5EUqqIU1SM2UigiQ__wJsQVF8";

let glsSupabase = null;


/* =========================================================
   2. FRONTEND PRICING
   Used for customer price preview only.
   Database calculates the official amount again.
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
   3. APPLICATION STATE
   ========================================================= */

let bookingInProgress = false;


/* =========================================================
   4. PAGE ELEMENTS
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
   5. CURRENCY
   ========================================================= */

const currencyFormatter =
    new Intl.NumberFormat(
        "en-MY",
        {
            style: "currency",
            currency: "MYR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );


function formatCurrency(value) {
    return currencyFormatter.format(
        Number(value) || 0
    );
}


/* =========================================================
   6. STATUS MESSAGE
   ========================================================= */

function setBookingMessage(
    message,
    type = ""
) {
    if (!bookingMessage) {
        return;
    }

    bookingMessage.textContent = message;
    bookingMessage.className = "booking-message";

    if (type) {
        bookingMessage.classList.add(type);
    }
}


/* =========================================================
   7. PRICE CALCULATION
   ========================================================= */

function calculatePrice() {
    const vehicleType =
        vehicleTypeInput.value;

    const washType =
        washTypeInput.value;

    if (
        !vehicleType ||
        !washType ||
        NORMAL_WASH_PRICES[vehicleType] === undefined
    ) {
        totalAmountDisplay.textContent =
            formatCurrency(0);

        return 0;
    }

    let amount =
        NORMAL_WASH_PRICES[vehicleType];

    if (washType === "Nano Wash") {
        amount += NANO_WASH_EXTRA;
    }

    totalAmountDisplay.textContent =
        formatCurrency(amount);

    return amount;
}


/* =========================================================
   8. BOOKING TYPE
   ========================================================= */

function updateBookingType() {
    const isFutureBooking =
        bookingTypeInput.value ===
        "Future Booking";

    futureBookingFields.hidden =
        !isFutureBooking;

    bookingDateInput.required =
        isFutureBooking;

    bookingTimeInput.required =
        isFutureBooking;

    if (!isFutureBooking) {
        bookingDateInput.value = "";
        bookingTimeInput.value = "";
    }

    setBookingMessage("");
}


/* =========================================================
   9. MINIMUM BOOKING DATE
   ========================================================= */

function setMinimumBookingDate() {
    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "Asia/Kuala_Lumpur",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        )
        .formatToParts(new Date());

    const values = {};

    parts.forEach((part) => {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    });

    bookingDateInput.min =
        `${values.year}-${values.month}-${values.day}`;
}


/* =========================================================
   10. NORMALISE PLATE NUMBER
   ========================================================= */

function normalisePlateNumber() {
    let value =
        plateNumberInput.value.toUpperCase();

    value = value.replace(
        /[^A-Z0-9 -]/g,
        ""
    );

    plateNumberInput.value = value;
}


/* =========================================================
   11. NORMALISE PHONE NUMBER
   ========================================================= */

function normalisePhoneNumber() {
    let value =
        phoneNumberInput.value.trim();

    value = value.replace(
        /[^\d+]/g,
        ""
    );

    if (value.includes("+")) {
        value =
            "+" +
            value.replace(/\+/g, "");
    }

    phoneNumberInput.value = value;
}


/* =========================================================
   12. VALIDATION
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


    const phoneDigits =
        phone.replace(/\D/g, "");

    if (
        phoneDigits.length < 9 ||
        phoneDigits.length > 15
    ) {
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
            "Please check your vehicle plate number.",
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
            "Please select your wash type.",
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

        const selectedDateTime =
            new Date(
                `${bookingDateInput.value}T${bookingTimeInput.value}:00+08:00`
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
   13. BUILD RPC PARAMETERS
   ========================================================= */

function buildBookingParameters() {
    const isFutureBooking =
        bookingTypeInput.value ===
        "Future Booking";

    return {
        p_phone_number:
            phoneNumberInput.value.trim(),

        p_plate_number:
            plateNumberInput.value
                .trim()
                .toUpperCase(),

        p_customer_name:
            customerNameInput.value.trim(),

        p_vehicle_type:
            vehicleTypeInput.value,

        p_wash_type:
            washTypeInput.value,

        p_booking_type:
            bookingTypeInput.value,

        p_booking_date:
            isFutureBooking
                ? bookingDateInput.value
                : null,

        p_booking_time:
            isFutureBooking
                ? bookingTimeInput.value
                : null
    };
}


/* =========================================================
   14. BUSY STATE
   ========================================================= */

function setBookingBusy(isBusy) {
    bookingInProgress = isBusy;

    continueButton.disabled = isBusy;

    phoneNumberInput.disabled = isBusy;
    plateNumberInput.disabled = isBusy;
    customerNameInput.disabled = isBusy;
    vehicleTypeInput.disabled = isBusy;
    washTypeInput.disabled = isBusy;
    bookingTypeInput.disabled = isBusy;

    if (
        bookingTypeInput.value ===
        "Future Booking"
    ) {
        bookingDateInput.disabled = isBusy;
        bookingTimeInput.disabled = isBusy;
    }

    continueButton.textContent =
        isBusy
            ? "Creating Booking..."
            : "Continue";
}


/* =========================================================
   15. CONFIRMATION
   ========================================================= */

function showBookingConfirmation(data) {
    const amount =
        formatCurrency(data.amount);

    if (
        data.booking_type === "Walk-In"
    ) {
        setBookingMessage(
            `Booking confirmed! ` +
            `Booking: ${data.booking_no} · ` +
            `Queue: ${data.queue_no} · ` +
            `${data.plate_number} · ` +
            `${data.vehicle_type} · ` +
            `${data.wash_type} · ` +
            `${amount} · ` +
            `Payment: UNPAID`,
            "success"
        );
    } else {
        setBookingMessage(
            `Booking confirmed! ` +
            `Booking: ${data.booking_no} · ` +
            `${data.plate_number} · ` +
            `${data.vehicle_type} · ` +
            `${data.wash_type} · ` +
            `${amount} · ` +
            `Payment: UNPAID`,
            "success"
        );
    }
}


/* =========================================================
   16. RESET FORM AFTER SUCCESS
   ========================================================= */

function resetBookingForm() {
    bookingForm.reset();

    futureBookingFields.hidden = true;

    bookingDateInput.required = false;
    bookingTimeInput.required = false;

    calculatePrice();
}


/* =========================================================
   17. DATABASE BOOKING SUBMISSION
   ========================================================= */

async function createBooking() {
    if (!glsSupabase) {
        throw new Error(
            "Booking service is unavailable."
        );
    }

    const parameters =
        buildBookingParameters();

    const {
        data,
        error
    } = await glsSupabase.rpc(
        "create_gls_booking",
        parameters
    );

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "No booking confirmation was returned."
        );
    }

    return data;
}


/* =========================================================
   18. SUBMIT
   ========================================================= */

async function handleBookingSubmit(event) {
    event.preventDefault();

    if (bookingInProgress) {
        return;
    }

    setBookingMessage("");

    if (!validateBooking()) {
        return;
    }


    setBookingBusy(true);

    setBookingMessage(
        "Creating your booking...",
        "info"
    );


    try {
        const booking =
            await createBooking();


        /*
         * Important:
         * Use the database-returned amount as
         * the authoritative price.
         */

        showBookingConfirmation(
            booking
        );


        console.log(
            "GLS booking created:",
            booking
        );


        /*
         * Clear customer form after successful
         * database submission.
         */

        resetBookingForm();

    } catch (error) {
        console.error(
            "GLS booking creation failed:",
            error
        );


        let message =
            "Unable to create your booking. Please try again.";


        if (
            error &&
            typeof error.message === "string"
        ) {
            const errorMessage =
                error.message.toLowerCase();


            if (
                errorMessage.includes(
                    "vehicle type is not available"
                )
            ) {
                message =
                    "The selected vehicle type is currently unavailable.";
            }

            else if (
                errorMessage.includes(
                    "future booking requires"
                )
            ) {
                message =
                    "Please select a booking date and time.";
            }

            else if (
                errorMessage.includes(
                    "phone number is required"
                )
            ) {
                message =
                    "Please enter your phone number.";
            }

            else if (
                errorMessage.includes(
                    "plate number is required"
                )
            ) {
                message =
                    "Please enter your vehicle plate number.";
            }
        }


        setBookingMessage(
            message,
            "error"
        );

    } finally {
        setBookingBusy(false);
    }
}


/* =========================================================
   19. INIT SUPABASE
   ========================================================= */

function initialiseSupabase() {
    if (
        !window.supabase ||
        typeof window.supabase.createClient !==
            "function"
    ) {
        throw new Error(
            "Supabase library could not be loaded."
        );
    }


    glsSupabase =
        window.supabase.createClient(
            GLS_SUPABASE_URL,
            GLS_SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );
}


/* =========================================================
   20. EVENT LISTENERS
   ========================================================= */

function registerEventListeners() {
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
}


/* =========================================================
   21. INITIALISE APPLICATION
   ========================================================= */

function initialiseBookingPage() {
    const requiredElements = [
        bookingForm,
        phoneNumberInput,
        plateNumberInput,
        customerNameInput,
        vehicleTypeInput,
        washTypeInput,
        bookingTypeInput,
        futureBookingFields,
        bookingDateInput,
        bookingTimeInput,
        totalAmountDisplay,
        bookingMessage,
        continueButton
    ];


    if (
        requiredElements.some(
            (element) => !element
        )
    ) {
        console.error(
            "GLS Booking: required HTML elements are missing."
        );

        return;
    }


    try {
        initialiseSupabase();

    } catch (error) {
        console.error(
            "GLS Booking: Supabase initialisation failed:",
            error
        );

        setBookingMessage(
            "Booking service is currently unavailable. Please refresh the page.",
            "error"
        );

        continueButton.disabled = true;

        return;
    }


    setMinimumBookingDate();

    updateBookingType();

    calculatePrice();

    registerEventListeners();

    setBookingMessage("");


    console.log(
        "GLS Car Wash V2 booking system ready."
    );
}


/* =========================================================
   22. START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initialiseBookingPage
    );
} else {
    initialiseBookingPage();
}
