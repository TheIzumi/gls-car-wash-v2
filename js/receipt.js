/* =========================================================
   GLS CAR WASH V2
   Official Receipt
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

let currentReceipt = null;


/* =========================================================
   2. PAGE ELEMENTS
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
   3. RECEIPT DATA ELEMENTS
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
   4. FORMAT CURRENCY
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
   5. FORMAT MALAYSIA DATE / TIME
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
   6. PAYMENT METHOD
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


    const key =
        String(
            method || ""
        )
        .toLowerCase();


    return (
        methods[key] ||
        method ||
        "—"
    );
}


/* =========================================================
   7. PAGE STATES
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
   8. URL PARAMETERS
   ========================================================= */

function getReceiptParameters() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );


    const booking =
        parameters.get(
            "booking"
        );


    const token =
        parameters.get(
            "token"
        );


    return {
        booking:
            booking
                ? booking.trim()
                : null,

        token:
            token
                ? token.trim()
                : null
    };
}


/* =========================================================
   9. UUID VALIDATION
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


    const pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    return pattern.test(
        value
    );
}


/* =========================================================
   10. GET STAFF SESSION
   ========================================================= */

async function getAuthenticatedSession() {

    const {
        data,
        error
    } =
        await glsSupabase
            .auth
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
   11. VERIFY STAFF PROFILE
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
   12. STAFF RECEIPT
   ========================================================= */

async function getStaffReceipt(
    bookingId
) {

    const session =
        await getAuthenticatedSession();


    await verifyStaffProfile(
        session
    );


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
   13. CUSTOMER RECEIPT
   ========================================================= */

async function getCustomerReceipt(
    token
) {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_gls_customer_receipt",
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
   14. POPULATE RECEIPT
   ========================================================= */

function populateReceipt(
    receipt
) {

    currentReceipt =
        receipt;


    receiptNumber.textContent =
        receipt.receipt_no ||
        "—";


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


    document.title =
        receipt.receipt_no
            ? `${receipt.receipt_no} | GLS Car Wash`
            : "GLS Car Wash | Official Receipt";
}


/* =========================================================
   15. ERROR MESSAGE
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
        rawMessage
            .toLowerCase();


    if (
        rawMessage ===
        "STAFF_LOGIN_REQUIRED"
    ) {

        return (
            "Staff sign-in is required to view this receipt."
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
            "receipt not found"
        )
    ) {

        return (
            "This receipt link is invalid or no longer available."
        );
    }


    if (
        message.includes(
            "receipt token is required"
        )
    ) {

        return (
            "No valid receipt reference was provided."
        );
    }


    if (
        message.includes(
            "booking not found"
        )
    ) {

        return (
            "The booking linked to this receipt could not be found."
        );
    }


    if (
        message.includes(
            "only available after payment"
        ) ||
        message.includes(
            "official receipt is not available"
        )
    ) {

        return (
            "An official receipt is only available after payment has been confirmed."
        );
    }


    if (
        message.includes(
            "confirmed payment record not found"
        )
    ) {

        return (
            "The confirmed payment record for this receipt could not be found."
        );
    }


    if (
        message.includes(
            "authentication required"
        )
    ) {

        return (
            "Staff sign-in is required to view this receipt."
        );
    }


    return (
        "Unable to retrieve this official receipt. Please check the receipt link and try again."
    );
}


/* =========================================================
   16. PRINT / SAVE PDF
   ========================================================= */

function handlePrintReceipt() {

    if (!currentReceipt) {
        return;
    }


    window.print();
}


/* =========================================================
   17. REQUIRED HTML CHECK
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
   18. SUPABASE
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
                     * Staff receipt links can use
                     * the existing dashboard session.
                     *
                     * Customer token links do not
                     * require authentication.
                     */

                    persistSession:
                        true,

                    autoRefreshToken:
                        true,

                    detectSessionInUrl:
                        false
                }
            }
        );
}


/* =========================================================
   19. EVENTS
   ========================================================= */

function registerEvents() {

    printReceiptButton
        .addEventListener(
            "click",
            handlePrintReceipt
        );
}


/* =========================================================
   20. INITIALISE RECEIPT
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


    const parameters =
        getReceiptParameters();


    /*
     * =========================================
     * CUSTOMER RECEIPT TOKEN
     *
     * Token takes priority when supplied.
     * No staff authentication required.
     * =========================================
     */

    if (
        parameters.token
    ) {

        if (
            !isValidUuid(
                parameters.token
            )
        ) {

            showError(
                "The receipt reference in this link is invalid."
            );


            return;
        }


        try {

            const receipt =
                await getCustomerReceipt(
                    parameters.token
                );


            populateReceipt(
                receipt
            );


            showReceipt();


            console.log(
                "GLS customer receipt loaded:",
                receipt.receipt_no
            );


            return;

        }

        catch (error) {

            console.error(
                "GLS customer receipt load failed:",
                error
            );


            showError(
                getFriendlyErrorMessage(
                    error
                )
            );


            return;
        }
    }


    /*
     * =========================================
     * STAFF RECEIPT
     *
     * Requires authenticated staff session.
     * =========================================
     */

    if (
        parameters.booking
    ) {

        if (
            !isValidUuid(
                parameters.booking
            )
        ) {

            showError(
                "The booking reference in this receipt link is invalid."
            );


            return;
        }


        try {

            const receipt =
                await getStaffReceipt(
                    parameters.booking
                );


            populateReceipt(
                receipt
            );


            showReceipt();


            console.log(
                "GLS staff receipt loaded:",
                receipt.receipt_no
            );


            return;

        }

        catch (error) {

            console.error(
                "GLS staff receipt load failed:",
                error
            );


            showError(
                getFriendlyErrorMessage(
                    error
                )
            );


            return;
        }
    }


    /*
     * No receipt reference.
     */

    showError(
        "No receipt reference was provided. Please open the receipt using a valid GLS receipt link."
    );
}


/* =========================================================
   21. START
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
