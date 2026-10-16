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
   2. PRICING PREVIEW

   IMPORTANT:
   These prices are only used for customer-facing preview.

   The official amount is recalculated by the Supabase
   create_gls_booking() database function.
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

let latestBooking = null;


/* =========================================================
   4. BOOKING FORM ELEMENTS
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
   5. CONFIRMATION UI ELEMENTS
   ========================================================= */

const bookingConfirmation =
    document.getElementById(
        "bookingConfirmation"
    );

const confirmationQueueSection =
    document.getElementById(
        "confirmationQueueSection"
    );

const confirmationQueueNo =
    document.getElementById(
        "confirmationQueueNo"
    );

const confirmationBookingNo =
    document.getElementById(
        "confirmationBookingNo"
    );

const confirmationPlate =
    document.getElementById(
        "confirmationPlate"
    );

const confirmationVehicle =
    document.getElementById(
        "confirmationVehicle"
    );

const confirmationService =
    document.getElementById(
        "confirmationService"
    );

const confirmationVisit =
    document.getElementById(
        "confirmationVisit"
    );

const confirmationAmount =
    document.getElementById(
        "confirmationAmount"
    );

const paymentButton =
    document.getElementById(
        "paymentButton"
    );

const newBookingButton =
    document.getElementById(
        "newBookingButton"
    );


/* =========================================================
   6. CURRENCY FORMATTER
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
   7. BOOKING MESSAGE
   ========================================================= */

function setBookingMessage(
    message,
    type = ""
) {

    if (!bookingMessage) {
        return;
    }


    bookingMessage.textContent =
        message || "";

    bookingMessage.className =
        "booking-message";


    if (type) {
        bookingMessage.classList.add(type);
    }
}


/* =========================================================
   8. PRICE CALCULATION
   ========================================================= */

function calculatePrice() {

    if (
        !vehicleTypeInput ||
        !washTypeInput ||
        !totalAmountDisplay
    ) {
        return 0;
    }


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
   9. BOOKING TYPE
   ========================================================= */

function updateBookingType() {

    if (
        !bookingTypeInput ||
        !futureBookingFields
    ) {
        return;
    }


    const isFutureBooking =
        bookingTypeInput.value ===
        "Future Booking";


    futureBookingFields.hidden =
        !isFutureBooking;


    if (bookingDateInput) {
        bookingDateInput.required =
            isFutureBooking;
    }


    if (bookingTimeInput) {
        bookingTimeInput.required =
            isFutureBooking;
    }


    if (!isFutureBooking) {

        if (bookingDateInput) {
            bookingDateInput.value = "";
        }

        if (bookingTimeInput) {
            bookingTimeInput.value = "";
        }
    }


    setBookingMessage("");
}


/* =========================================================
   10. MALAYSIA DATE
   ========================================================= */

function getMalaysiaToday() {

    const formatter =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Asia/Kuala_Lumpur",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        );


    const parts =
        formatter.formatToParts(
            new Date()
        );


    const values = {};


    parts.forEach(
        (part) => {

            if (
                part.type !==
                "literal"
            ) {

                values[part.type] =
                    part.value;
            }
        }
    );


    return (
        `${values.year}-` +
        `${values.month}-` +
        `${values.day}`
    );
}


/* =========================================================
   11. MINIMUM BOOKING DATE
   ========================================================= */

function setMinimumBookingDate() {

    if (!bookingDateInput) {
        return;
    }


    bookingDateInput.min =
        getMalaysiaToday();
}


/* =========================================================
   12. NORMALISE PLATE NUMBER
   ========================================================= */

function normalisePlateNumber() {

    if (!plateNumberInput) {
        return;
    }


    let value =
        plateNumberInput.value
            .toUpperCase();


    value =
        value.replace(
            /[^A-Z0-9 -]/g,
            ""
        );


    value =
        value.replace(
            /\s+/g,
            " "
        );


    plateNumberInput.value =
        value;
}


/* =========================================================
   13. NORMALISE PHONE NUMBER
   ========================================================= */

function normalisePhoneNumber() {

    if (!phoneNumberInput) {
        return;
    }


    let value =
        phoneNumberInput.value;


    value =
        value.replace(
            /[^\d+]/g,
            ""
        );


    /*
     * Allow + only at the beginning.
     */

    if (value.includes("+")) {

        value =
            "+" +
            value.replace(
                /\+/g,
                ""
            );
    }


    phoneNumberInput.value =
        value;
}


/* =========================================================
   14. VALIDATION
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


    /* PHONE */

    if (!phone) {

        setBookingMessage(
            "Please enter your phone number.",
            "error"
        );

        phoneNumberInput.focus();

        return false;
    }


    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


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


    /* PLATE */

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


    /* VEHICLE */

    if (!vehicleType) {

        setBookingMessage(
            "Please select your vehicle type.",
            "error"
        );

        vehicleTypeInput.focus();

        return false;
    }


    if (
        NORMAL_WASH_PRICES[
            vehicleType
        ] === undefined
    ) {

        setBookingMessage(
            "The selected vehicle type is invalid.",
            "error"
        );

        vehicleTypeInput.focus();

        return false;
    }


    /* WASH */

    if (
        ![
            "Normal Wash",
            "Nano Wash"
        ].includes(washType)
    ) {

        setBookingMessage(
            "Please select your wash type.",
            "error"
        );

        washTypeInput.focus();

        return false;
    }


    /* BOOKING TYPE */

    if (
        ![
            "Walk-In",
            "Future Booking"
        ].includes(bookingType)
    ) {

        setBookingMessage(
            "Please select your visit type.",
            "error"
        );

        bookingTypeInput.focus();

        return false;
    }


    /* FUTURE BOOKING */

    if (
        bookingType ===
        "Future Booking"
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
                `${bookingDateInput.value}` +
                `T${bookingTimeInput.value}:00+08:00`
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
   15. BUILD RPC PARAMETERS
   ========================================================= */

function buildBookingParameters() {

    const futureBooking =
        bookingTypeInput.value ===
        "Future Booking";


    return {

        p_phone_number:
            phoneNumberInput
                .value
                .trim(),

        p_plate_number:
            plateNumberInput
                .value
                .trim()
                .toUpperCase(),

        p_customer_name:
            customerNameInput
                .value
                .trim(),

        p_vehicle_type:
            vehicleTypeInput.value,

        p_wash_type:
            washTypeInput.value,

        p_booking_type:
            bookingTypeInput.value,

        p_booking_date:
            futureBooking
                ? bookingDateInput.value
                : null,

        p_booking_time:
            futureBooking
                ? bookingTimeInput.value
                : null
    };
}


/* =========================================================
   16. BUSY STATE
   ========================================================= */

function setBookingBusy(isBusy) {

    bookingInProgress = isBusy;


    const controls = [
        phoneNumberInput,
        plateNumberInput,
        customerNameInput,
        vehicleTypeInput,
        washTypeInput,
        bookingTypeInput,
        bookingDateInput,
        bookingTimeInput
    ];


    controls.forEach(
        (control) => {

            if (control) {
                control.disabled =
                    isBusy;
            }
        }
    );


    if (continueButton) {

        continueButton.disabled =
            isBusy;

        continueButton.textContent =
            isBusy
                ? "Creating Booking..."
                : "Continue";
    }
}


/* =========================================================
   17. DATABASE SUBMISSION
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
    } =
        await glsSupabase.rpc(
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
   18. BOOKING CONFIRMATION
   ========================================================= */

function showBookingConfirmation(
    data,
    submittedData
) {

    latestBooking = data;


    /*
     * Hide form and show confirmation.
     */

    bookingForm.hidden = true;

    bookingConfirmation.hidden =
        false;


    confirmationBookingNo.textContent =
        data.booking_no || "-";


    confirmationPlate.textContent =
        data.plate_number || "-";


    confirmationVehicle.textContent =
        data.vehicle_type || "-";


    confirmationService.textContent =
        data.wash_type || "-";


    confirmationAmount.textContent =
        formatCurrency(
            data.amount
        );


    /* WALK-IN */

    if (
        data.booking_type ===
        "Walk-In"
    ) {

        confirmationQueueSection.hidden =
            false;


        confirmationQueueNo.textContent =
            data.queue_no || "-";


        confirmationVisit.textContent =
            "Walk-In / Wash Now";
    }


    /* FUTURE BOOKING */

    else {

        confirmationQueueSection.hidden =
            true;


        if (
            submittedData.bookingDate &&
            submittedData.bookingTime
        ) {

            confirmationVisit.textContent =
                `${submittedData.bookingDate}` +
                ` · ` +
                `${submittedData.bookingTime}`;
        }

        else {

            confirmationVisit.textContent =
                "Future Booking";
        }
    }


    bookingConfirmation.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });
}


/* =========================================================
   19. RESET FOR NEW BOOKING
   ========================================================= */

function startNewBooking() {

    latestBooking = null;


    bookingForm.reset();


    bookingConfirmation.hidden =
        true;

    bookingForm.hidden =
        false;


    futureBookingFields.hidden =
        true;


    bookingDateInput.required =
        false;

    bookingTimeInput.required =
        false;


    setBookingMessage("");


    calculatePrice();

    updateBookingType();


    bookingForm.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });


    window.setTimeout(
        () => {

            phoneNumberInput.focus();

        },
        350
    );
}


/* =========================================================
   20. PAYMENT BUTTON
   ========================================================= */

function handlePaymentButton() {

    if (!latestBooking) {

        alert(
            "Booking information is unavailable."
        );

        return;
    }


    /*
     * Payment module will replace this
     * temporary message in the next development step.
     */

    alert(
        `Payment options for ` +
        `${latestBooking.booking_no} ` +
        `will be available in the next step.`
    );
}


/* =========================================================
   21. SUBMIT HANDLER
   ========================================================= */

async function handleBookingSubmit(
    event
) {

    event.preventDefault();


    if (bookingInProgress) {
        return;
    }


    setBookingMessage("");


    if (!validateBooking()) {
        return;
    }


    /*
     * Preserve future booking information
     * before any form state changes.
     */

    const submittedData = {

        bookingDate:
            bookingDateInput.value,

        bookingTime:
            bookingTimeInput.value
    };


    setBookingBusy(true);


    setBookingMessage(
        "Creating your booking...",
        "info"
    );


    try {

        const booking =
            await createBooking();


        console.log(
            "GLS booking created:",
            booking
        );


        showBookingConfirmation(
            booking,
            submittedData
        );


    } catch (error) {

        console.error(
            "GLS booking creation failed:",
            error
        );


        let message =
            "Unable to create your booking. Please try again.";


        if (
            error &&
            typeof error.message ===
                "string"
        ) {

            const errorMessage =
                error.message
                    .toLowerCase();


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
                    "Please select your booking date and time.";
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


            else if (
                errorMessage.includes(
                    "invalid wash type"
                )
            ) {

                message =
                    "Please select a valid wash type.";
            }


            else if (
                errorMessage.includes(
                    "invalid booking type"
                )
            ) {

                message =
                    "Please select a valid visit type.";
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
   22. SUPABASE INITIALISATION
   ========================================================= */

function initialiseSupabase() {

    if (
        !window.supabase ||
        typeof
            window.supabase.createClient
            !== "function"
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

                    persistSession:
                        false,

                    autoRefreshToken:
                        false,

                    detectSessionInUrl:
                        false
                }
            }
        );
}


/* =========================================================
   23. REGISTER EVENTS
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


    newBookingButton.addEventListener(
        "click",
        startNewBooking
    );


    paymentButton.addEventListener(
        "click",
        handlePaymentButton
    );
}


/* =========================================================
   24. VERIFY REQUIRED HTML
   ========================================================= */

function requiredElementsExist() {

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
        continueButton,

        bookingConfirmation,

        confirmationQueueSection,
        confirmationQueueNo,

        confirmationBookingNo,
        confirmationPlate,
        confirmationVehicle,
        confirmationService,
        confirmationVisit,
        confirmationAmount,

        paymentButton,
        newBookingButton
    ];


    return !requiredElements.some(
        (element) =>
            !element
    );
}


/* =========================================================
   25. INITIALISE BOOKING PAGE
   ========================================================= */

function initialiseBookingPage() {

    if (!requiredElementsExist()) {

        console.error(
            "GLS Booking: one or more required HTML elements are missing."
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


        continueButton.disabled =
            true;


        return;
    }


    setMinimumBookingDate();


    updateBookingType();


    calculatePrice();


    bookingConfirmation.hidden =
        true;


    registerEventListeners();


    setBookingMessage("");


    console.log(
        "GLS Car Wash V2 booking system ready."
    );
}


/* =========================================================
   26. START APPLICATION
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseBookingPage
    );

}

else {

    initialiseBookingPage();
}
