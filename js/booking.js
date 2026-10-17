/* =========================================================
   GLS CAR WASH V2
   Customer Booking + Payment Flow
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
   2. PRICE PREVIEW
   Official price is recalculated by database RPC.
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

let paymentSubmissionInProgress = false;

let latestBooking = null;

let latestSubmittedBooking = null;

let paymentStatusTimer = null;

let paymentStatusCheckInProgress = false;

const PAYMENT_STATUS_INTERVAL = 5000;


/* =========================================================
   4. BOOKING FORM ELEMENTS
   ========================================================= */

const bookingFormSection =
    document.getElementById(
        "bookingFormSection"
    );

const bookingForm =
    document.getElementById(
        "booking-form"
    );

const phoneNumberInput =
    document.getElementById(
        "phoneNumber"
    );

const plateNumberInput =
    document.getElementById(
        "plateNumber"
    );

const customerNameInput =
    document.getElementById(
        "customerName"
    );

const vehicleTypeInput =
    document.getElementById(
        "vehicleType"
    );

const washTypeInput =
    document.getElementById(
        "washType"
    );

const bookingTypeInput =
    document.getElementById(
        "bookingType"
    );

const futureBookingFields =
    document.getElementById(
        "futureBookingFields"
    );

const bookingDateInput =
    document.getElementById(
        "bookingDate"
    );

const bookingTimeInput =
    document.getElementById(
        "bookingTime"
    );

const totalAmountDisplay =
    document.getElementById(
        "totalAmount"
    );

const bookingMessage =
    document.getElementById(
        "bookingMessage"
    );

const continueButton =
    document.getElementById(
        "continueButton"
    );


/* =========================================================
   5. BOOKING CONFIRMATION ELEMENTS
   ========================================================= */

const bookingConfirmation =
    document.getElementById(
        "bookingConfirmation"
    );

const confirmationHeading =
    document.getElementById(
        "confirmationHeading"
    );

const confirmationDescription =
    document.getElementById(
        "confirmationDescription"
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
   6. PAYMENT METHOD ELEMENTS
   ========================================================= */

const paymentSection =
    document.getElementById(
        "paymentSection"
    );

const paymentBackButton =
    document.getElementById(
        "paymentBackButton"
    );

const paymentAmount =
    document.getElementById(
        "paymentAmount"
    );

const cashPaymentButton =
    document.getElementById(
        "cashPaymentButton"
    );

const duitNowPaymentButton =
    document.getElementById(
        "duitNowPaymentButton"
    );

const bankTransferPaymentButton =
    document.getElementById(
        "bankTransferPaymentButton"
    );


/* =========================================================
   7. CASH ELEMENTS
   ========================================================= */

const cashPaymentSection =
    document.getElementById(
        "cashPaymentSection"
    );

const cashBackButton =
    document.getElementById(
        "cashBackButton"
    );

const cashPaymentAmount =
    document.getElementById(
        "cashPaymentAmount"
    );


/* =========================================================
   8. DUITNOW ELEMENTS
   ========================================================= */

const duitNowPaymentSection =
    document.getElementById(
        "duitNowPaymentSection"
    );

const duitNowBackButton =
    document.getElementById(
        "duitNowBackButton"
    );

const duitNowPaymentAmount =
    document.getElementById(
        "duitNowPaymentAmount"
    );

const paymentSubmittedButton =
    document.getElementById(
        "paymentSubmittedButton"
    );


/* =========================================================
   9. BANK TRANSFER ELEMENTS
   ========================================================= */

const bankTransferPaymentSection =
    document.getElementById(
        "bankTransferPaymentSection"
    );

const bankTransferBackButton =
    document.getElementById(
        "bankTransferBackButton"
    );

const bankTransferAmount =
    document.getElementById(
        "bankTransferAmount"
    );

const bankTransferReference =
    document.getElementById(
        "bankTransferReference"
    );

const bankTransferSubmittedButton =
    document.getElementById(
        "bankTransferSubmittedButton"
    );


/* =========================================================
   10. PAYMENT PENDING ELEMENTS
   ========================================================= */

const paymentPendingSection =
    document.getElementById(
        "paymentPendingSection"
    );

const pendingBookingNo =
    document.getElementById(
        "pendingBookingNo"
    );

const pendingPlate =
    document.getElementById(
        "pendingPlate"
    );

const pendingAmount =
    document.getElementById(
        "pendingAmount"
    );


/* =========================================================
   11. PAYMENT SUCCESS ELEMENTS
   ========================================================= */

const paymentSuccessSection =
    document.getElementById(
        "paymentSuccessSection"
    );

const successBookingNo =
    document.getElementById(
        "successBookingNo"
    );

const successQueueNo =
    document.getElementById(
        "successQueueNo"
    );

const successPlate =
    document.getElementById(
        "successPlate"
    );

const successAmount =
    document.getElementById(
        "successAmount"
    );

const successReceiptNo =
    document.getElementById(
        "successReceiptNo"
    );

const viewCustomerReceiptButton =
    document.getElementById(
        "viewCustomerReceiptButton"
    );

const successNewBookingButton =
    document.getElementById(
        "successNewBookingButton"
    );


/* =========================================================
   12. CURRENCY
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
   13. PAGE STATE
   ========================================================= */

const applicationSections = [
    bookingFormSection,
    bookingConfirmation,
    paymentSection,
    cashPaymentSection,
    duitNowPaymentSection,
    bankTransferPaymentSection,
    paymentPendingSection,
    paymentSuccessSection
];


function showOnlySection(
    section
) {

    applicationSections.forEach(
        function (item) {

            if (item) {
                item.hidden =
                    item !== section;
            }
        }
    );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================================================
   14. BOOKING MESSAGE
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
        bookingMessage.classList.add(
            type
        );
    }
}


/* =========================================================
   15. PRICE PREVIEW
   ========================================================= */

function calculatePrice() {

    const vehicleType =
        vehicleTypeInput.value;

    const washType =
        washTypeInput.value;


    if (
        !vehicleType ||
        !washType ||
        NORMAL_WASH_PRICES[
            vehicleType
        ] === undefined
    ) {

        totalAmountDisplay.textContent =
            formatCurrency(0);

        return 0;
    }


    let amount =
        NORMAL_WASH_PRICES[
            vehicleType
        ];


    if (
        washType ===
        "Nano Wash"
    ) {

        amount +=
            NANO_WASH_EXTRA;
    }


    totalAmountDisplay.textContent =
        formatCurrency(
            amount
        );


    return amount;
}


/* =========================================================
   16. BOOKING TYPE
   ========================================================= */

function updateBookingType() {

    const futureBooking =
        bookingTypeInput.value ===
        "Future Booking";


    futureBookingFields.hidden =
        !futureBooking;


    bookingDateInput.required =
        futureBooking;

    bookingTimeInput.required =
        futureBooking;


    if (!futureBooking) {

        bookingDateInput.value =
            "";

        bookingTimeInput.value =
            "";
    }


    setBookingMessage("");
}


/* =========================================================
   17. MALAYSIA DATE
   ========================================================= */

function getMalaysiaToday() {

    const parts =
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
        )
        .formatToParts(
            new Date()
        );


    const values = {};


    parts.forEach(
        function (part) {

            if (
                part.type !==
                "literal"
            ) {

                values[
                    part.type
                ] =
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


function setMinimumBookingDate() {

    bookingDateInput.min =
        getMalaysiaToday();
}


/* =========================================================
   18. INPUT NORMALISATION
   ========================================================= */

function normalisePlateNumber() {

    let value =
        plateNumberInput
            .value
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


function normalisePhoneNumber() {

    let value =
        phoneNumberInput.value;


    value =
        value.replace(
            /[^\d+]/g,
            ""
        );


    if (
        value.includes("+")
    ) {

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
   19. VALIDATION
   ========================================================= */

function validateBooking() {

    const phone =
        phoneNumberInput
            .value
            .trim();

    const plate =
        plateNumberInput
            .value
            .trim();

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


    if (
        !plate ||
        plate.length < 2
    ) {

        setBookingMessage(
            "Please enter a valid vehicle plate number.",
            "error"
        );

        plateNumberInput.focus();

        return false;
    }


    if (
        NORMAL_WASH_PRICES[
            vehicleType
        ] === undefined
    ) {

        setBookingMessage(
            "Please select your vehicle type.",
            "error"
        );

        vehicleTypeInput.focus();

        return false;
    }


    if (
        ![
            "Normal Wash",
            "Nano Wash"
        ].includes(
            washType
        )
    ) {

        setBookingMessage(
            "Please select your wash type.",
            "error"
        );

        washTypeInput.focus();

        return false;
    }


    if (
        ![
            "Walk-In",
            "Future Booking"
        ].includes(
            bookingType
        )
    ) {

        setBookingMessage(
            "Please select your visit type.",
            "error"
        );

        bookingTypeInput.focus();

        return false;
    }


    if (
        bookingType ===
        "Future Booking"
    ) {

        if (
            !bookingDateInput.value
        ) {

            setBookingMessage(
                "Please select your booking date.",
                "error"
            );

            bookingDateInput.focus();

            return false;
        }


        if (
            !bookingTimeInput.value
        ) {

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
                selectedDateTime
                    .getTime()
            ) ||
            selectedDateTime
                .getTime() <=
                Date.now()
        ) {

            setBookingMessage(
                "Please select a future booking date and time.",
                "error"
            );

            return false;
        }
    }


    return true;
}


/* =========================================================
   20. RPC PARAMETERS
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
   21. BOOKING BUSY STATE
   ========================================================= */

function setBookingBusy(
    isBusy
) {

    bookingInProgress =
        isBusy;


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
        function (control) {

            if (control) {
                control.disabled =
                    isBusy;
            }
        }
    );


    continueButton.disabled =
        isBusy;


    continueButton.textContent =
        isBusy
            ? "Creating Booking..."
            : "Continue";
}


/* =========================================================
   22. CREATE BOOKING
   ========================================================= */

async function createBooking() {

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
   23. SHOW BOOKING CONFIRMATION
   ========================================================= */

function showBookingConfirmation(
    booking,
    submittedBooking
) {

    latestBooking =
        booking;

    latestSubmittedBooking =
        submittedBooking;


    confirmationBookingNo.textContent =
        booking.booking_no ||
        "-";

    confirmationPlate.textContent =
        booking.plate_number ||
        "-";

    confirmationVehicle.textContent =
        booking.vehicle_type ||
        "-";

    confirmationService.textContent =
        booking.wash_type ||
        "-";

    confirmationAmount.textContent =
        formatCurrency(
            booking.amount
        );


    if (
        booking.booking_type ===
        "Walk-In"
    ) {

        confirmationHeading.textContent =
            "You're in the queue!";

        confirmationDescription.textContent =
            "Please keep this screen for reference.";

        confirmationQueueSection.hidden =
            false;

        confirmationQueueNo.textContent =
            booking.queue_no ||
            "-";

        confirmationVisit.textContent =
            "Walk-In / Wash Now";
    }

    else {

        confirmationHeading.textContent =
            "Booking Confirmed!";

        confirmationDescription.textContent =
            "Your future booking has been registered.";

        confirmationQueueSection.hidden =
            true;


        if (
            submittedBooking.bookingDate &&
            submittedBooking.bookingTime
        ) {

            confirmationVisit.textContent =
                `${submittedBooking.bookingDate}` +
                ` · ` +
                `${submittedBooking.bookingTime}`;

        }

        else {

            confirmationVisit.textContent =
                "Future Booking";
        }
    }


    showOnlySection(
        bookingConfirmation
    );
}


/* =========================================================
   24. SUBMIT BOOKING
   ========================================================= */

async function handleBookingSubmit(
    event
) {

    event.preventDefault();


    if (
        bookingInProgress
    ) {
        return;
    }


    setBookingMessage("");


    if (
        !validateBooking()
    ) {
        return;
    }


    const submittedBooking = {
        bookingDate:
            bookingDateInput.value,

        bookingTime:
            bookingTimeInput.value
    };


    setBookingBusy(
        true
    );


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
            submittedBooking
        );

    }

    catch (error) {

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

            const databaseMessage =
                error.message
                    .toLowerCase();


            if (
                databaseMessage.includes(
                    "vehicle type is not available"
                )
            ) {

                message =
                    "The selected vehicle type is currently unavailable.";
            }


            else if (
                databaseMessage.includes(
                    "future booking requires"
                )
            ) {

                message =
                    "Please select your booking date and time.";
            }


            else if (
                databaseMessage.includes(
                    "phone number is required"
                )
            ) {

                message =
                    "Please enter your phone number.";
            }


            else if (
                databaseMessage.includes(
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

    }

    finally {

        setBookingBusy(
            false
        );
    }
}


/* =========================================================
   25. PAYMENT MENU
   ========================================================= */

function openPaymentSection() {

    if (!latestBooking) {
        return;
    }


    stopPaymentStatusPolling();


    paymentAmount.textContent =
        formatCurrency(
            latestBooking.amount
        );


    showOnlySection(
        paymentSection
    );
}


function returnToBookingConfirmation() {

    stopPaymentStatusPolling();


    showOnlySection(
        bookingConfirmation
    );
}


/* =========================================================
   26. SAVE SELECTED PAYMENT METHOD
   ========================================================= */

async function saveSelectedPaymentMethod(
    paymentMethod
) {

    if (
        !latestBooking ||
        !latestBooking.id
    ) {

        throw new Error(
            "Booking information is unavailable."
        );
    }


    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "select_gls_payment_method",
            {
                p_booking_id:
                    latestBooking.id,

                p_payment_method:
                    paymentMethod
            }
        );


    if (error) {
        throw error;
    }


    latestBooking.selected_payment_method =
        paymentMethod;


    return data;
}


/* =========================================================
   27. CASH PAYMENT
   ========================================================= */

async function openCashPayment() {

    if (!latestBooking) {
        return;
    }


    try {

        /*
         * Store that the customer selected Cash.
         */

        await saveSelectedPaymentMethod(
            "cash"
        );


        cashPaymentAmount.textContent =
            formatCurrency(
                latestBooking.amount
            );


        showOnlySection(
            cashPaymentSection
        );


        /*
         * IMPORTANT:
         *
         * Cash has no customer-side
         * "I've Made Payment" button.
         *
         * Start checking the payment status
         * immediately.
         *
         * Once staff confirms Cash payment,
         * this page automatically changes
         * from AWAITING PAYMENT to PAID.
         */

        startPaymentStatusPolling();

    }

    catch (error) {

        console.error(
            "Unable to select cash payment:",
            error
        );


        alert(
            "Unable to select Cash payment. Please try again."
        );
    }
}


/* =========================================================
   28. DUITNOW PAYMENT
   ========================================================= */

async function openDuitNowPayment() {

    if (!latestBooking) {
        return;
    }


    try {

        stopPaymentStatusPolling();


        await saveSelectedPaymentMethod(
            "duitnow"
        );


        duitNowPaymentAmount.textContent =
            formatCurrency(
                latestBooking.amount
            );


        showOnlySection(
            duitNowPaymentSection
        );

    }

    catch (error) {

        console.error(
            "Unable to select DuitNow payment:",
            error
        );


        alert(
            "Unable to select DuitNow QR. Please try again."
        );
    }
}


/* =========================================================
   29. BANK TRANSFER PAYMENT
   ========================================================= */

async function openBankTransferPayment() {

    if (!latestBooking) {
        return;
    }


    try {

        stopPaymentStatusPolling();


        await saveSelectedPaymentMethod(
            "transfer"
        );


        bankTransferAmount.textContent =
            formatCurrency(
                latestBooking.amount
            );


        bankTransferReference.textContent =
            latestBooking.booking_no ||
            "-";


        showOnlySection(
            bankTransferPaymentSection
        );

    }

    catch (error) {

        console.error(
            "Unable to select Bank Transfer:",
            error
        );


        alert(
            "Unable to select Bank Transfer. Please try again."
        );
    }
}


/* =========================================================
   30. MARK CUSTOMER PAYMENT PENDING
   ========================================================= */

async function markPaymentPending() {

    if (!latestBooking) {

        throw new Error(
            "Booking information is unavailable."
        );
    }


    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "mark_gls_payment_pending",
            {
                p_booking_id:
                    latestBooking.id
            }
        );


    if (error) {
        throw error;
    }


    return data;
}


/* =========================================================
   31. SUBMIT PAYMENT FOR VERIFICATION
   ========================================================= */

async function submitPaymentForVerification(
    paymentMethod,
    button
) {

    if (
        paymentSubmissionInProgress ||
        !latestBooking
    ) {
        return;
    }


    paymentSubmissionInProgress =
        true;


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Submitting...";


    try {

        await markPaymentPending();


        latestBooking.payment_status =
            "pending";


        latestBooking.submitted_payment_method =
            paymentMethod;


        pendingBookingNo.textContent =
            latestBooking.booking_no ||
            "-";


        pendingPlate.textContent =
            latestBooking.plate_number ||
            "-";


        pendingAmount.textContent =
            formatCurrency(
                latestBooking.amount
            );


        showOnlySection(
            paymentPendingSection
        );


        /*
         * Start monitoring after customer
         * submits DuitNow / Transfer.
         */

        startPaymentStatusPolling();


        console.log(
            "GLS payment submitted for verification:",
            latestBooking.booking_no,
            paymentMethod
        );

    }

    catch (error) {

        console.error(
            "GLS payment verification submission failed:",
            error
        );


        alert(
            "Unable to submit payment for verification. " +
            "Please show your booking to GLS staff."
        );

    }

    finally {

        paymentSubmissionInProgress =
            false;


        if (
            document.body.contains(
                button
            )
        ) {

            button.disabled =
                false;


            button.textContent =
                originalText;
        }
    }
}


/* =========================================================
   32. CUSTOMER PAYMENT STATUS
   ========================================================= */

async function getCustomerPaymentStatus() {

    if (
        !latestBooking ||
        !latestBooking.id
    ) {
        return null;
    }


    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_gls_customer_payment_status",
            {
                p_booking_id:
                    latestBooking.id
            }
        );


    if (error) {
        throw error;
    }


    return data;
}


function stopPaymentStatusPolling() {

    if (
        paymentStatusTimer !==
        null
    ) {

        window.clearInterval(
            paymentStatusTimer
        );


        paymentStatusTimer =
            null;
    }
}


function showPaymentSuccess(
    paymentStatus
) {

    stopPaymentStatusPolling();


    latestBooking.payment_status =
        "paid";


    latestBooking.receipt_no =
        paymentStatus.receipt_no;


    latestBooking.receipt_token =
        paymentStatus.receipt_token;


    successBookingNo.textContent =
        paymentStatus.booking_no ||
        latestBooking.booking_no ||
        "-";


    successQueueNo.textContent =
        paymentStatus.queue_no ||
        latestBooking.queue_no ||
        "-";


    successPlate.textContent =
        paymentStatus.plate_number ||
        latestBooking.plate_number ||
        "-";


    successAmount.textContent =
        formatCurrency(
            paymentStatus.amount ||
            latestBooking.amount
        );


    successReceiptNo.textContent =
        paymentStatus.receipt_no ||
        "-";


    viewCustomerReceiptButton.disabled =
        !paymentStatus.receipt_token;


    showOnlySection(
        paymentSuccessSection
    );
}


async function checkPaymentStatus() {

    if (
        paymentStatusCheckInProgress ||
        !latestBooking ||
        latestBooking.payment_status ===
            "paid"
    ) {
        return;
    }


    paymentStatusCheckInProgress =
        true;


    try {

        const paymentStatus =
            await getCustomerPaymentStatus();


        if (!paymentStatus) {
            return;
        }


        console.log(
            "GLS payment status:",
            paymentStatus.payment_status
        );


        if (
            paymentStatus.payment_status ===
            "paid"
        ) {

            showPaymentSuccess(
                paymentStatus
            );
        }

    }

    catch (error) {

        /*
         * Temporary polling failure should
         * not interrupt the customer page.
         */

        console.warn(
            "GLS payment status check failed:",
            error
        );

    }

    finally {

        paymentStatusCheckInProgress =
            false;
    }
}


function startPaymentStatusPolling() {

    stopPaymentStatusPolling();


    /*
     * Check immediately.
     */

    checkPaymentStatus();


    /*
     * Then every 5 seconds.
     */

    paymentStatusTimer =
        window.setInterval(
            checkPaymentStatus,
            PAYMENT_STATUS_INTERVAL
        );
}


/* =========================================================
   33. SUBMIT DUITNOW
   ========================================================= */

async function handlePaymentSubmitted() {

    await submitPaymentForVerification(
        "duitnow",
        paymentSubmittedButton
    );
}


/* =========================================================
   34. SUBMIT BANK TRANSFER
   ========================================================= */

async function handleBankTransferSubmitted() {

    await submitPaymentForVerification(
        "transfer",
        bankTransferSubmittedButton
    );
}


/* =========================================================
   35. CUSTOMER RECEIPT
   ========================================================= */

function openCustomerReceipt() {

    if (
        !latestBooking ||
        !latestBooking.receipt_token
    ) {
        return;
    }


    /*
     * Customer receipt token flow.
     *
     * receipt.html / receipt.js must support
     * ?token= for this button to work.
     */

    const receiptUrl =
        `receipt.html?token=${encodeURIComponent(
            latestBooking.receipt_token
        )}`;


    window.location.href =
        receiptUrl;
}


/* =========================================================
   36. START ANOTHER BOOKING
   ========================================================= */

function startNewBooking() {

    stopPaymentStatusPolling();


    latestBooking =
        null;

    latestSubmittedBooking =
        null;


    bookingForm.reset();


    futureBookingFields.hidden =
        true;

    bookingDateInput.required =
        false;

    bookingTimeInput.required =
        false;


    setBookingMessage("");


    calculatePrice();

    updateBookingType();


    showOnlySection(
        bookingFormSection
    );


    window.setTimeout(
        function () {

            phoneNumberInput.focus();

        },
        300
    );
}


/* =========================================================
   37. REQUIRED ELEMENT CHECK
   ========================================================= */

function requiredElementsExist() {

    const requiredElements = {
        bookingFormSection,
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
        confirmationHeading,
        confirmationDescription,
        confirmationQueueSection,
        confirmationQueueNo,
        confirmationBookingNo,
        confirmationPlate,
        confirmationVehicle,
        confirmationService,
        confirmationVisit,
        confirmationAmount,

        paymentButton,
        newBookingButton,

        paymentSection,
        paymentBackButton,
        paymentAmount,

        cashPaymentButton,
        duitNowPaymentButton,
        bankTransferPaymentButton,

        cashPaymentSection,
        cashBackButton,
        cashPaymentAmount,

        duitNowPaymentSection,
        duitNowBackButton,
        duitNowPaymentAmount,
        paymentSubmittedButton,

        bankTransferPaymentSection,
        bankTransferBackButton,
        bankTransferAmount,
        bankTransferReference,
        bankTransferSubmittedButton,

        paymentPendingSection,
        pendingBookingNo,
        pendingPlate,
        pendingAmount,

        paymentSuccessSection,
        successBookingNo,
        successQueueNo,
        successPlate,
        successAmount,
        successReceiptNo,
        viewCustomerReceiptButton,
        successNewBookingButton
    };


    const missing =
        Object.entries(
            requiredElements
        )
        .filter(
            function (
                [name, element]
            ) {

                return !element;
            }
        )
        .map(
            function (
                [name]
            ) {

                return name;
            }
        );


    if (
        missing.length > 0
    ) {

        console.error(
            "GLS Booking missing HTML elements:",
            missing
        );


        return false;
    }


    return true;
}


/* =========================================================
   38. EVENT LISTENERS
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


    paymentButton.addEventListener(
        "click",
        openPaymentSection
    );


    newBookingButton.addEventListener(
        "click",
        startNewBooking
    );


    paymentBackButton.addEventListener(
        "click",
        returnToBookingConfirmation
    );


    cashPaymentButton.addEventListener(
        "click",
        openCashPayment
    );


    duitNowPaymentButton.addEventListener(
        "click",
        openDuitNowPayment
    );


    bankTransferPaymentButton.addEventListener(
        "click",
        openBankTransferPayment
    );


    cashBackButton.addEventListener(
        "click",
        openPaymentSection
    );


    duitNowBackButton.addEventListener(
        "click",
        openPaymentSection
    );


    bankTransferBackButton.addEventListener(
        "click",
        openPaymentSection
    );


    paymentSubmittedButton.addEventListener(
        "click",
        handlePaymentSubmitted
    );


    bankTransferSubmittedButton.addEventListener(
        "click",
        handleBankTransferSubmitted
    );


    viewCustomerReceiptButton.addEventListener(
        "click",
        openCustomerReceipt
    );


    successNewBookingButton.addEventListener(
        "click",
        startNewBooking
    );


    /*
     * Stop background polling if customer
     * leaves the page.
     */

    window.addEventListener(
        "beforeunload",
        stopPaymentStatusPolling
    );
}


/* =========================================================
   39. SUPABASE
   ========================================================= */

function initialiseSupabase() {

    if (
        !window.supabase ||
        typeof
            window.supabase
                .createClient !==
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

                    /*
                     * Customer booking page does not
                     * require a staff Auth session.
                     */

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
   40. INITIALISE
   ========================================================= */

function initialiseBookingPage() {

    if (
        !requiredElementsExist()
    ) {

        console.error(
            "GLS Booking: required HTML elements are missing."
        );


        return;
    }


    try {

        initialiseSupabase();

    }

    catch (error) {

        console.error(
            "GLS Booking Supabase initialisation failed:",
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

    registerEventListeners();


    /*
     * IMPORTANT:
     *
     * Fresh customer visit always begins
     * at the Booking Form.
     *
     * Payment polling starts only after
     * customer reaches Cash waiting screen
     * or submits DuitNow / Transfer.
     */

    showOnlySection(
        bookingFormSection
    );


    console.log(
        "GLS Car Wash V2 booking and payment system ready."
    );
}


/* =========================================================
   41. START
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
