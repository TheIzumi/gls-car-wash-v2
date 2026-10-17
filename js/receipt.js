/* =========================================================
   GLS CAR WASH V2
   Official Receipt
   Staff + Customer Secure Access
   File: js/receipt.js
   ========================================================= */

"use strict";


/* =========================================================
   1. SUPABASE CONFIGURATION
   ========================================================= */

const GLS_SUPABASE_URL =
    "https://nfzlsjcrhaxvftpnokah.supabase.co";

const GLS_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_WJtd9t5EUqqIU1SM2UigiQ__wJsQVF8";

const GLS_TIMEZONE =
    "Asia/Kuala_Lumpur";

let glsSupabase = null;


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

let currentReceipt = null;

let receiptAccessMode = null;


/* =========================================================
   3. PAGE ELEMENTS
   ========================================================= */

const receiptLoading =
    document.getElementById(
        "receiptLoading"
    );

const receiptError =
    document.getElementById(
        "receiptError"
    );

const receiptErrorMessage =
    document.getElementById(
        "receiptErrorMessage"
    );

const receiptContainer =
    document.getElementById(
        "receiptContainer"
    );


/* =========================================================
   4. RECEIPT ELEMENTS
   ========================================================= */

const receiptNumber =
    document.getElementById(
        "receiptNumber"
    );

const receiptDate =
    document.getElementById(
        "receiptDate"
    );

const receiptCustomer =
    document.getElementById(
        "receiptCustomer"
    );

const receiptPlate =
    document.getElementById(
        "receiptPlate"
    );

const receiptVehicle =
    document.getElementById(
        "receiptVehicle"
    );

const receiptService =
    document.getElementById(
        "receiptService"
    );

const receiptPaymentMethod =
    document.getElementById(
        "receiptPaymentMethod"
    );

const receiptPaymentStatus =
    document.getElementById(
        "receiptPaymentStatus"
    );

const receiptAmount =
    document.getElementById(
        "receiptAmount"
    );

const receiptBookingNo =
    document.getElementById(
        "receiptBookingNo"
    );

const receiptQueueNo =
    document.getElementById(
        "receiptQueueNo"
    );

const printReceiptButton =
    document.getElementById(
        "printReceiptButton"
    );


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
   6. MALAYSIA DATE / TIME
   ========================================================= */

function formatMalaysiaDateTime(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }


    return new Intl.DateTimeFormat(
        "en-MY",
        {
            timeZone:
                GLS_TIMEZONE,

            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true
        }
    ).format(date);
}


/* =========================================================
   7. PAYMENT METHOD LABEL
   ========================================================= */

function formatPaymentMethod(
    method
) {

    const methods = {

        cash:
            "Cash",

        duitnow:
            "DuitNow QR",

        transfer:
            "Bank Transfer",

        other:
            "Other"
    };


    const normalizedMethod =
        String(
            method || ""
        ).toLowerCase();


    return (
        methods[normalizedMethod] ||
        method ||
        "—"
    );
}


/* =========================================================
   8. PAGE STATES
   ========================================================= */

function showLoading() {

    receiptLoading.hidden =
        false;

    receiptError.hidden =
        true;

    receiptContainer.hidden =
        true;
}


function showError(
    message
) {

    receiptLoading.hidden =
        true;

    receiptContainer.hidden =
        true;

    receiptError.hidden =
        false;


    receiptErrorMessage.textContent =
        message ||
        "Unable to retrieve this receipt.";
}


function showReceipt() {

    receiptLoading.hidden =
        true;

    receiptError.hidden =
        true;

    receiptContainer.hidden =
        false;
}


/* =========================================================
   9. URL PARAMETERS
   ========================================================= */

function getReceiptParameters() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );


    const bookingId =
        parameters.get(
            "booking"
        );


    const publicToken =
        parameters.get(
            "t"
        );


    return {

        bookingId:
            bookingId
                ? bookingId.trim()
                : null,

        publicToken:
            publicToken
                ? publicToken.trim()
                : null
    };
}


/* =========================================================
   10. UUID VALIDATION
   ========================================================= */

function isValidUuid(
    value
) {

    if (
        typeof value !==
        "string"
    ) {
        return false;
    }


    const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    return uuidPattern.test(
        value
    );
}


/* =========================================================
   11. GET STAFF SESSION
   ========================================================= */

async function getAuthenticatedSession() {

    const {
        data,
        error
    } =
        await glsSupabase.auth
            .getSession();


    if (error) {
        throw error;
    }


    if (
        !data ||
        !data.session ||
        !data.session.user
    ) {

        throw new Error(
            "STAFF_LOGIN_REQUIRED"
        );
    }


    return data.session;
}


/* =========================================================
   12. VERIFY STAFF PROFILE
   ========================================================= */

async function verifyStaffProfile(
    session
) {

    const {
        data: profile,
        error
    } =
        await glsSupabase.rpc(
            "get_my_gls_profile"
        );


    if (error) {
        throw error;
    }


    if (
        !profile ||
        profile.id !==
            session.user.id ||
        profile.is_active !==
            true ||
        ![
            "admin",
            "staff"
        ].includes(
            profile.role
        )
    ) {

        throw new Error(
            "STAFF_NOT_AUTHORISED"
        );
    }


    return profile;
}


/* =========================================================
   13. STAFF RECEIPT
   ========================================================= */

async function getStaffReceipt(
    bookingId
) {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_or_create_gls_receipt",
            {
                p_booking_id:
                    bookingId
            }
        );


    if (error) {
        throw error;
    }


    if (!data) {

        throw new Error(
            "No receipt data was returned."
        );
    }


    return data;
}


/* =========================================================
   14. CUSTOMER PUBLIC RECEIPT
   ========================================================= */

async function getPublicReceipt(
    token
) {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_gls_public_receipt",
            {
                p_token:
                    token
            }
        );


    if (error) {
        throw error;
    }


    if (!data) {

        throw new Error(
            "No receipt data was returned."
        );
    }


    return data;
}


/* =========================================================
   15. POPULATE RECEIPT
   ========================================================= */

function populateReceipt(
    receipt
) {

    currentReceipt =
        receipt;


    receiptNumber.textContent =
        receipt.receipt_no ||
        "—";


    /*
     * Use confirmed payment time as
     * transaction date.
     */

    receiptDate.textContent =
        formatMalaysiaDateTime(
            receipt.paid_at ||
            receipt.issued_at
        );


    receiptCustomer.textContent =
        receipt.customer_name ||
        "Walk-in Customer";


    receiptPlate.textContent =
        receipt.plate_number ||
        "—";


    receiptVehicle.textContent =
        receipt.vehicle_type ||
        "—";


    receiptService.textContent =
        receipt.wash_type ||
        "—";


    receiptPaymentMethod.textContent =
        formatPaymentMethod(
            receipt.payment_method
        );


    receiptPaymentStatus.textContent =
        String(
            receipt.payment_status ||
            "paid"
        ).toUpperCase();


    receiptAmount.textContent =
        formatCurrency(
            receipt.amount
        );


    receiptBookingNo.textContent =
        receipt.booking_no ||
        "—";


    receiptQueueNo.textContent =
        receipt.queue_no ||
        "—";


    /*
     * Meaningful PDF / print filename title.
     */

    document.title =
        receipt.receipt_no
            ? `${receipt.receipt_no} | GLS Car Wash`
            : "GLS Car Wash | Official Receipt";
}


/* =========================================================
   16. FRIENDLY ERROR
   ========================================================= */

function getFriendlyErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to retrieve this receipt."
        );
    }


    const rawMessage =
        String(
            error.message ||
            ""
        );


    const message =
        rawMessage.toLowerCase();


    if (
        rawMessage ===
        "STAFF_LOGIN_REQUIRED"
    ) {

        return (
            "Staff sign-in is required to view this receipt from the dashboard."
        );
    }


    if (
        rawMessage ===
        "STAFF_NOT_AUTHORISED"
    ) {

        return (
            "This account is not authorised to view GLS receipts."
        );
    }


    if (
        message.includes(
            "receipt token is required"
        )
    ) {

        return (
            "The receipt link is incomplete."
        );
    }


    if (
        message.includes(
            "receipt not found"
        )
    ) {

        return (
            "This receipt link is invalid or the receipt could not be found."
        );
    }


    if (
        message.includes(
            "receipt is unavailable"
        )
    ) {

        return (
            "This official receipt is currently unavailable."
        );
    }


    if (
        message.includes(
            "booking not found"
        )
    ) {

        return (
            "The booking associated with this receipt could not be found."
        );
    }


    if (
        message.includes(
            "payment record not found"
        )
    ) {

        return (
            "The confirmed payment record for this receipt could not be found."
        );
    }


    if (
        message.includes(
            "only available after payment"
        )
    ) {

        return (
            "An official receipt is only available after payment has been confirmed."
        );
    }


    if (
        message.includes(
            "authentication required"
        )
    ) {

        return (
            "Staff sign-in is required to view this receipt from the dashboard."
        );
    }


    if (
        message.includes(
            "inactive"
        )
    ) {

        return (
            "Your GLS staff account is currently inactive."
        );
    }


    if (
        message.includes(
            "not authorised"
        )
    ) {

        return (
            "Your account is not authorised to view this receipt."
        );
    }


    return (
        "Unable to retrieve this official receipt. Please check the receipt link and try again."
    );
}


/* =========================================================
   17. PRINT / SAVE PDF
   ========================================================= */

function handlePrintReceipt() {

    if (!currentReceipt) {
        return;
    }


    try {

        window.print();

    }

    catch (error) {

        console.error(
            "GLS receipt printing failed:",
            error
        );


        alert(
            "Unable to open the print menu. " +
            "Please use your browser menu and select Print or Save as PDF."
        );
    }
}


/* =========================================================
   18. REQUIRED HTML CHECK
   ========================================================= */

function requiredElementsExist() {

    const required = {

        receiptLoading,
        receiptError,
        receiptErrorMessage,
        receiptContainer,

        receiptNumber,
        receiptDate,

        receiptCustomer,
        receiptPlate,
        receiptVehicle,
        receiptService,

        receiptPaymentMethod,
        receiptPaymentStatus,

        receiptAmount,

        receiptBookingNo,
        receiptQueueNo,

        printReceiptButton
    };


    const missing =
        Object.entries(
            required
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
            "GLS Receipt missing HTML elements:",
            missing
        );


        return false;
    }


    return true;
}


/* =========================================================
   19. SUPABASE INITIALISATION
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
            "Supabase library failed to load."
        );
    }


    glsSupabase =
        window.supabase.createClient(
            GLS_SUPABASE_URL,
            GLS_SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {

                    /*
                     * Keep staff session available
                     * for dashboard-launched receipts.
                     */

                    persistSession:
                        true,

                    autoRefreshToken:
                        true,

                    detectSessionInUrl:
                        true
                }
            }
        );
}


/* =========================================================
   20. REGISTER EVENTS
   ========================================================= */

function registerEvents() {

    printReceiptButton
        .addEventListener(
            "click",
            handlePrintReceipt
        );
}


/* =========================================================
   21. LOAD STAFF RECEIPT MODE
   ========================================================= */

async function loadStaffReceipt(
    bookingId
) {

    receiptAccessMode =
        "staff";


    if (
        !isValidUuid(
            bookingId
        )
    ) {

        throw new Error(
            "INVALID_BOOKING_ID"
        );
    }


    const session =
        await getAuthenticatedSession();


    await verifyStaffProfile(
        session
    );


    return await getStaffReceipt(
        bookingId
    );
}


/* =========================================================
   22. LOAD CUSTOMER RECEIPT MODE
   ========================================================= */

async function loadCustomerReceipt(
    token
) {

    receiptAccessMode =
        "customer";


    if (
        !isValidUuid(
            token
        )
    ) {

        throw new Error(
            "INVALID_RECEIPT_TOKEN"
        );
    }


    /*
     * No staff authentication is required.
     * The random receipt token is validated
     * by get_gls_public_receipt().
     */

    return await getPublicReceipt(
        token
    );
}


/* =========================================================
   23. INITIALISE RECEIPT
   ========================================================= */

async function initialiseReceipt() {

    if (
        !requiredElementsExist()
    ) {

        console.error(
            "GLS Receipt: required HTML elements are missing."
        );


        return;
    }


    showLoading();


    try {

        initialiseSupabase();

    }

    catch (error) {

        console.error(
            "GLS Receipt Supabase initialisation failed:",
            error
        );


        showError(
            "Receipt service is currently unavailable. Please refresh the page."
        );


        return;
    }


    registerEvents();


    const {
        bookingId,
        publicToken
    } =
        getReceiptParameters();


    /*
     * Customer secure token takes priority
     * if both parameters somehow exist.
     */

    if (
        !publicToken &&
        !bookingId
    ) {

        showError(
            "No receipt reference was provided. Please open the receipt using a valid GLS receipt link."
        );


        return;
    }


    try {

        let receipt;


        if (publicToken) {

            receipt =
                await loadCustomerReceipt(
                    publicToken
                );

        }

        else {

            receipt =
                await loadStaffReceipt(
                    bookingId
                );
        }


        populateReceipt(
            receipt
        );


        showReceipt();


        console.log(
            "GLS official receipt loaded:",
            receipt.receipt_no,
            `(${receiptAccessMode})`
        );

    }

    catch (error) {

        console.error(
            "GLS Receipt load failed:",
            error
        );


        const rawMessage =
            String(
                error &&
                error.message
                    ? error.message
                    : ""
            );


        if (
            rawMessage ===
            "INVALID_RECEIPT_TOKEN"
        ) {

            showError(
                "The secure receipt link is invalid."
            );


            return;
        }


        if (
            rawMessage ===
            "INVALID_BOOKING_ID"
        ) {

            showError(
                "The booking reference in this receipt link is invalid."
            );


            return;
        }


        showError(
            getFriendlyErrorMessage(
                error
            )
        );
    }
}


/* =========================================================
   24. START APPLICATION
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseReceipt
    );

}

else {

    initialiseReceipt();
}
