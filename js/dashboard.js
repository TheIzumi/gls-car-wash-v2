/* =========================================================
   GLS CAR WASH V2
   Staff / Owner Operations Dashboard
   File: js/dashboard.js
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

let currentProfile = null;

let loginInProgress = false;
let dashboardLoading = false;
let paymentConfirmationInProgress = false;

let activeQueueFilter = "active";

let dashboardRefreshTimer = null;


/* =========================================================
   3. AUTH ELEMENTS
   ========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");

const dashboardScreen =
    document.getElementById("dashboardScreen");

const authStatus =
    document.getElementById("authStatus");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================================
   4. DASHBOARD ELEMENTS
   ========================================================= */

const welcomeText =
    document.getElementById("welcomeText");

const currentDate =
    document.getElementById("currentDate");

const vehiclesToday =
    document.getElementById("vehiclesToday");

const revenueToday =
    document.getElementById("revenueToday");

const waitingCount =
    document.getElementById("waitingCount");

const washingCount =
    document.getElementById("washingCount");

const pendingPaymentCount =
    document.getElementById("pendingPaymentCount");


/* =========================================================
   5. PAYMENT ELEMENTS
   ========================================================= */

const refreshPaymentsButton =
    document.getElementById(
        "refreshPaymentsButton"
    );

const paymentMessage =
    document.getElementById(
        "paymentMessage"
    );

const pendingPaymentsList =
    document.getElementById(
        "pendingPaymentsList"
    );


/* =========================================================
   6. QUEUE ELEMENTS
   ========================================================= */

const refreshQueueButton =
    document.getElementById(
        "refreshQueueButton"
    );

const queueMessage =
    document.getElementById(
        "queueMessage"
    );

const queueList =
    document.getElementById(
        "queueList"
    );

const queueFilterButtons =
    document.querySelectorAll(
        ".queue-filter"
    );


/* =========================================================
   7. RECENT BOOKINGS
   ========================================================= */

const recentBookingsList =
    document.getElementById(
        "recentBookingsList"
    );


/* =========================================================
   8. CURRENCY
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
   9. MALAYSIA DATE / TIME
   ========================================================= */

function formatMalaysiaDateTime(value) {

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
                "short",

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


function updateCurrentDate() {

    if (!currentDate) {
        return;
    }


    currentDate.textContent =
        new Intl.DateTimeFormat(
            "en-MY",
            {
                timeZone:
                    GLS_TIMEZONE,

                weekday:
                    "long",

                day:
                    "numeric",

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
        ).format(new Date());
}


/* =========================================================
   10. STATUS MESSAGE
   ========================================================= */

function setMessage(
    element,
    message,
    type = ""
) {

    if (!element) {
        return;
    }


    element.textContent =
        message || "";

    element.className =
        "status-message";


    if (type) {
        element.classList.add(type);
    }
}


/* =========================================================
   11. DOM HELPERS
   ========================================================= */

function createElement(
    tag,
    className = "",
    text = ""
) {

    const element =
        document.createElement(tag);


    if (className) {
        element.className =
            className;
    }


    if (
        text !== undefined &&
        text !== null
    ) {

        element.textContent =
            String(text);
    }


    return element;
}


function createStatusBadge(status) {

    const safeStatus =
        String(
            status || ""
        )
        .toLowerCase();


    return createElement(
        "span",
        `status-badge ${safeStatus}`,
        safeStatus || "unknown"
    );
}


/* =========================================================
   12. LOGIN SCREEN
   ========================================================= */

function showLoginScreen(
    message = "",
    type = ""
) {

    currentProfile = null;


    if (loginScreen) {
        loginScreen.hidden =
            false;
    }


    if (dashboardScreen) {
        dashboardScreen.hidden =
            true;
    }


    if (authStatus) {
        authStatus.textContent =
            "Please sign in";
    }


    if (logoutButton) {
        logoutButton.hidden =
            true;

        logoutButton.disabled =
            false;

        logoutButton.textContent =
            "Log Out";
    }


    setMessage(
        loginMessage,
        message,
        type
    );


    stopDashboardRefresh();
}


/* =========================================================
   13. DASHBOARD SCREEN
   ========================================================= */

function showDashboard(profile) {

    currentProfile =
        profile;


    loginScreen.hidden =
        true;

    dashboardScreen.hidden =
        false;


    logoutButton.hidden =
        false;


    const displayName =
        profile.full_name ||
        "GLS User";


    const displayRole =
        profile.role === "admin"
            ? "Admin"
            : "Staff";


    authStatus.textContent =
        `${displayName} · ${displayRole}`;


    welcomeText.textContent =
        `Welcome back, ${displayName}.`;


    if (loginPassword) {
        loginPassword.value =
            "";
    }


    setMessage(
        loginMessage,
        ""
    );


    updateCurrentDate();


    startDashboardRefresh();
}


/* =========================================================
   14. VERIFY GLS PROFILE
   ========================================================= */

async function verifyUserProfile(
    session
) {
    if (
        !session ||
        !session.user
    ) {
        

    if (
        !session ||
        !session.user
    ) {

        showLoginScreen();

        return false;
    }


    const {
        data: profile,
        error
    } =
        await glsSupabase
            .from("profiles")
            .select(
                "id, full_name, role, is_active"
            )
            .eq(
                "id",
                session.user.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "GLS profile verification failed:",
            error
        );


        await glsSupabase.auth.signOut({
            scope:
                "local"
        });


        showLoginScreen(
            "Unable to verify your GLS staff profile.",
            "error"
        );


        return false;
    }


    if (
        !profile ||
        profile.is_active !== true ||
        ![
            "admin",
            "staff"
        ].includes(profile.role)
    ) {

        await glsSupabase.auth.signOut({
            scope:
                "local"
        });


        showLoginScreen(
            "This account is not authorised to access the GLS dashboard.",
            "error"
        );


        return false;
    }


    showDashboard(profile);


    await refreshDashboard();


    return true;
}


/* =========================================================
   15. LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();

    if (
        loginInProgress ||
        !glsSupabase
    ) {
        return;
    }


    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    if (
        !email ||
        !password
    ) {

        setMessage(
            loginMessage,
            "Enter your email address and password.",
            "error"
        );

        return;
    }


    loginInProgress =
        true;


    loginButton.disabled =
        true;

    loginButton.textContent =
        "Signing In...";


    setMessage(
        loginMessage,
        "Verifying your GLS account...",
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await glsSupabase.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            console.error(
                "GLS sign-in failed:",
                error
            );


            setMessage(
                loginMessage,
                "Sign-in failed. Check your email and password.",
                "error"
            );


            return;
        }


        if (
            !data.session
        ) {

            setMessage(
                loginMessage,
                "No active login session was created.",
                "error"
            );

            return;
        }

        await verifyUserProfile(
            data.session
        );

    }

    catch (error) {

        console.error(
            "Unexpected GLS login error:",
            error
        );


        setMessage(
            loginMessage,
            "Unable to sign in. Please try again.",
            "error"
        );

    }

    finally {

        loginInProgress =
            false;


        loginButton.disabled =
            false;

        loginButton.textContent =
            "Sign In";
    }
}


/* =========================================================
   16. LOGOUT
   ========================================================= */

async function handleLogout() {

    if (
        !glsSupabase ||
        logoutButton.disabled
    ) {
        return;
    }


    logoutButton.disabled =
        true;

    logoutButton.textContent =
        "Signing Out...";


    try {

        const {
            error
        } =
            await glsSupabase.auth.signOut({
                scope:
                    "local"
            });


        if (error) {
            throw error;
        }


        showLoginScreen(
            "Signed out successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "GLS logout failed:",
            error
        );


        logoutButton.disabled =
            false;

        logoutButton.textContent =
            "Log Out";


        alert(
            "Unable to sign out. Please try again."
        );
    }
}


/* =========================================================
   17. LOAD SECURE DASHBOARD DATA
   ========================================================= */

async function getDashboardData() {

    /*
     * This secure RPC is created in the next
     * SQL step.
     *
     * We deliberately DO NOT query bookings
     * directly from the browser.
     */

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_gls_dashboard_data"
        );


    if (error) {
        throw error;
    }


    if (!data) {
        throw new Error(
            "No dashboard data returned."
        );
    }


    return data;
}


/* =========================================================
   18. SUMMARY CARDS
   ========================================================= */

function renderSummary(data) {

    const summary =
        data.summary || {};


    vehiclesToday.textContent =
        Number(
            summary.vehicles_today
        ) || 0;


    revenueToday.textContent =
        formatCurrency(
            summary.revenue_today
        );


    waitingCount.textContent =
        Number(
            summary.waiting
        ) || 0;


    washingCount.textContent =
        Number(
            summary.washing
        ) || 0;


    pendingPaymentCount.textContent =
        Number(
            summary.payment_pending
        ) || 0;
}


/* =========================================================
   19. PAYMENT VERIFICATION RENDERING
   ========================================================= */

function renderPendingPayments(rows) {

    pendingPaymentsList.replaceChildren();


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        pendingPaymentsList.appendChild(
            createElement(
                "div",
                "empty-state",
                "No payments are waiting for verification."
            )
        );

        return;
    }


    rows.forEach(
        (booking) => {

            const card =
                createElement(
                    "article",
                    "operation-card"
                );


            const main =
                createElement(
                    "div",
                    "operation-main"
                );


            const topLine =
                createElement(
                    "div",
                    "operation-topline"
                );


            topLine.appendChild(
                createElement(
                    "strong",
                    "queue-number",
                    booking.queue_no ||
                        booking.booking_no
                )
            );


            topLine.appendChild(
                createElement(
                    "span",
                    "plate-number",
                    booking.plate_number
                )
            );


            topLine.appendChild(
                createStatusBadge(
                    booking.payment_status
                )
            );


            main.appendChild(
                topLine
            );


            const meta =
                createElement(
                    "div",
                    "operation-meta"
                );


            [
                booking.customer_name ||
                    "Walk-in customer",

                booking.vehicle_type,

                booking.wash_type,

                booking.booking_no
            ]
            .forEach(
                (value) => {

                    meta.appendChild(
                        createElement(
                            "span",
                            "",
                            value
                        )
                    );
                }
            );


            main.appendChild(meta);


            const side =
                createElement(
                    "div",
                    ""
                );


            side.appendChild(
                createElement(
                    "div",
                    "operation-amount",
                    formatCurrency(
                        booking.amount
                    )
                )
            );


            const controls =
                createElement(
                    "div",
                    "payment-confirm-controls"
                );


            const methodSelect =
                document.createElement(
                    "select"
                );


            methodSelect.setAttribute(
                "aria-label",
                `Payment method for ${booking.booking_no}`
            );


            [
                ["duitnow", "DuitNow QR"],
                ["cash", "Cash"],
                ["transfer", "Transfer"],
                ["other", "Other"]
            ]
            .forEach(
                ([value, text]) => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        value;

                    option.textContent =
                        text;


                    methodSelect.appendChild(
                        option
                    );
                }
            );


            /*
             * Pending from customer QR defaults
             * to DuitNow.
             */

            methodSelect.value =
                "duitnow";


            const confirmButton =
                createElement(
                    "button",
                    "confirm-button",
                    "Confirm Payment"
                );


            confirmButton.type =
                "button";


            confirmButton.addEventListener(
                "click",
                async () => {

                    await confirmPayment(
                        booking,
                        methodSelect.value,
                        confirmButton,
                        methodSelect
                    );
                }
            );


            controls.appendChild(
                methodSelect
            );


            controls.appendChild(
                confirmButton
            );


            side.appendChild(
                controls
            );


            card.appendChild(main);

            card.appendChild(side);


            pendingPaymentsList.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   20. CONFIRM PAYMENT
   ========================================================= */

async function confirmPayment(
    booking,
    paymentMethod,
    button,
    methodSelect
) {

    if (
        paymentConfirmationInProgress
    ) {
        return;
    }


    if (
        ![
            "cash",
            "duitnow",
            "transfer",
            "other"
        ].includes(paymentMethod)
    ) {

        setMessage(
            paymentMessage,
            "Select a valid payment method.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Confirm ${formatCurrency(
                booking.amount
            )} payment for ` +
            `${booking.plate_number} ` +
            `(${booking.booking_no})?`
        );


    if (!confirmed) {
        return;
    }


    paymentConfirmationInProgress =
        true;


    button.disabled =
        true;

    methodSelect.disabled =
        true;

    button.textContent =
        "Confirming...";


    setMessage(
        paymentMessage,
        `Confirming payment for ${booking.booking_no}...`,
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await glsSupabase.rpc(
                "confirm_gls_payment",
                {
                    p_booking_id:
                        booking.id,

                    p_payment_method:
                        paymentMethod
                }
            );


        if (error) {
            throw error;
        }


        console.log(
            "GLS payment confirmed:",
            data
        );


        setMessage(
            paymentMessage,
            `Payment confirmed for ${booking.booking_no}.`,
            "success"
        );


        await refreshDashboard();

    }

    catch (error) {

        console.error(
            "GLS payment confirmation failed:",
            error
        );


        let message =
            "Unable to confirm payment.";


        if (
            error &&
            typeof error.message === "string"
        ) {

            const value =
                error.message
                    .toLowerCase();


            if (
                value.includes(
                    "already been confirmed"
                )
            ) {

                message =
                    "This payment has already been confirmed.";
            }

            else if (
                value.includes(
                    "not authorised"
                )
            ) {

                message =
                    "Your account is not authorised to confirm payment.";
            }

            else if (
                value.includes(
                    "inactive"
                )
            ) {

                message =
                    "Your GLS staff account is inactive.";
            }
        }


        setMessage(
            paymentMessage,
            message,
            "error"
        );

    }

    finally {

        paymentConfirmationInProgress =
            false;


        /*
         * Card may already have disappeared after
         * successful dashboard refresh.
         */

        if (
            document.body.contains(
                button
            )
        ) {

            button.disabled =
                false;

            button.textContent =
                "Confirm Payment";
        }


        if (
            document.body.contains(
                methodSelect
            )
        ) {

            methodSelect.disabled =
                false;
        }
    }
}


/* =========================================================
   21. QUEUE FILTERING
   ========================================================= */

function getFilteredQueue(rows) {

    if (!Array.isArray(rows)) {
        return [];
    }


    if (
        activeQueueFilter ===
        "active"
    ) {

        return rows.filter(
            (row) =>
                [
                    "waiting",
                    "washing"
                ].includes(
                    row.queue_status
                )
        );
    }


    return rows.filter(
        (row) =>
            row.queue_status ===
            activeQueueFilter
    );
}


/* =========================================================
   22. QUEUE RENDERING
   ========================================================= */

function renderQueue(rows) {

    queueList.replaceChildren();


    const filtered =
        getFilteredQueue(rows);


    if (
        filtered.length === 0
    ) {

        queueList.appendChild(
            createElement(
                "div",
                "empty-state",
                "No vehicles found for this queue filter."
            )
        );

        return;
    }


    filtered.forEach(
        (booking) => {

            const card =
                createElement(
                    "article",
                    "operation-card"
                );


            const main =
                createElement(
                    "div",
                    "operation-main"
                );


            const topLine =
                createElement(
                    "div",
                    "operation-topline"
                );


            topLine.appendChild(
                createElement(
                    "strong",
                    "queue-number",
                    booking.queue_no ||
                        "BOOKING"
                )
            );


            topLine.appendChild(
                createElement(
                    "span",
                    "plate-number",
                    booking.plate_number
                )
            );


            topLine.appendChild(
                createStatusBadge(
                    booking.queue_status
                )
            );


            main.appendChild(
                topLine
            );


            const meta =
                createElement(
                    "div",
                    "operation-meta"
                );


            [
                booking.vehicle_type,
                booking.wash_type,
                formatCurrency(
                    booking.amount
                ),
                booking.payment_status ===
                    "paid"
                    ? "PAID"
                    : booking.payment_status
                        .toUpperCase()
            ]
            .forEach(
                (value) => {

                    meta.appendChild(
                        createElement(
                            "span",
                            "",
                            value
                        )
                    );
                }
            );


            main.appendChild(meta);


            const side =
                createElement(
                    "div",
                    ""
                );


            side.appendChild(
                createElement(
                    "div",
                    "operation-amount",
                    formatCurrency(
                        booking.amount
                    )
                )
            );


            /*
             * Queue action buttons will become
             * operational after secure queue RPC
             * functions are added.
             */

            const actions =
                createElement(
                    "div",
                    "operation-actions"
                );


            if (
                booking.queue_status ===
                "waiting"
            ) {

                const button =
                    createElement(
                        "button",
                        "start-button",
                        "Start Wash"
                    );


                button.type =
                    "button";

                button.disabled =
                    true;

                button.title =
                    "Queue action backend will be enabled next.";


                actions.appendChild(
                    button
                );
            }


            else if (
                booking.queue_status ===
                "washing"
            ) {

                const button =
                    createElement(
                        "button",
                        "complete-button",
                        "Complete"
                    );


                button.type =
                    "button";

                button.disabled =
                    true;


                actions.appendChild(
                    button
                );
            }


            side.appendChild(
                actions
            );


            card.appendChild(main);

            card.appendChild(side);


            queueList.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   23. RECENT BOOKINGS
   ========================================================= */

function renderRecentBookings(rows) {

    recentBookingsList.replaceChildren();


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        recentBookingsList.appendChild(
            createElement(
                "div",
                "empty-state",
                "No recent bookings."
            )
        );

        return;
    }


    rows.forEach(
        (booking) => {

            const card =
                createElement(
                    "article",
                    "operation-card"
                );


            const main =
                createElement(
                    "div",
                    "operation-main"
                );


            const topLine =
                createElement(
                    "div",
                    "operation-topline"
                );


            topLine.appendChild(
                createElement(
                    "strong",
                    "queue-number",
                    booking.queue_no ||
                        "BOOKING"
                )
            );


            topLine.appendChild(
                createElement(
                    "span",
                    "plate-number",
                    booking.plate_number
                )
            );


            topLine.appendChild(
                createStatusBadge(
                    booking.payment_status
                )
            );


            main.appendChild(
                topLine
            );


            const meta =
                createElement(
                    "div",
                    "operation-meta"
                );


            [
                booking.booking_no,
                booking.vehicle_type,
                booking.wash_type,
                formatMalaysiaDateTime(
                    booking.created_at
                )
            ]
            .forEach(
                (value) => {

                    meta.appendChild(
                        createElement(
                            "span",
                            "",
                            value
                        )
                    );
                }
            );


            main.appendChild(meta);


            const side =
                createElement(
                    "div",
                    "operation-amount",
                    formatCurrency(
                        booking.amount
                    )
                );


            card.appendChild(main);

            card.appendChild(side);


            recentBookingsList.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   24. REFRESH DASHBOARD
   ========================================================= */

async function refreshDashboard() {

    if (
        !currentProfile ||
        dashboardScreen.hidden ||
        dashboardLoading
    ) {
        return;
    }


    dashboardLoading =
        true;


    refreshPaymentsButton.disabled =
        true;

    refreshQueueButton.disabled =
        true;


    updateCurrentDate();


    try {

        const data =
            await getDashboardData();


        renderSummary(
            data
        );


        renderPendingPayments(
            data.pending_payments ||
            []
        );


        renderQueue(
            data.queue ||
            []
        );


        renderRecentBookings(
            data.recent_bookings ||
            []
        );


        setMessage(
            queueMessage,
            ""
        );

    }

    catch (error) {

        console.error(
            "GLS dashboard refresh failed:",
            error
        );


        /*
         * This message is expected until
         * get_gls_dashboard_data RPC is created.
         */

        const message =
            error &&
            typeof error.message === "string" &&
            error.message.includes(
                "get_gls_dashboard_data"
            )
                ? (
                    "Dashboard data RPC is not configured yet."
                )
                : (
                    "Unable to refresh dashboard data."
                );


        setMessage(
            queueMessage,
            message,
            "error"
        );


        setMessage(
            paymentMessage,
            message,
            "error"
        );

    }

    finally {

        dashboardLoading =
            false;


        refreshPaymentsButton.disabled =
            false;

        refreshQueueButton.disabled =
            false;
    }
}


/* =========================================================
   25. QUEUE FILTER BUTTONS
   ========================================================= */

function handleQueueFilter(event) {

    const button =
        event.currentTarget;


    activeQueueFilter =
        button.dataset.status ||
        "active";


    queueFilterButtons.forEach(
        (item) => {

            item.classList.toggle(
                "active",
                item === button
            );
        }
    );


    /*
     * Refresh current dashboard payload.
     * Secure RPC remains the data source.
     */

    refreshDashboard();
}


/* =========================================================
   26. AUTO REFRESH
   ========================================================= */

function startDashboardRefresh() {

    stopDashboardRefresh();


    dashboardRefreshTimer =
        window.setInterval(
            () => {
                refreshDashboard();
            },
            20000
        );
}


function stopDashboardRefresh() {

    if (
        dashboardRefreshTimer !==
        null
    ) {

        window.clearInterval(
            dashboardRefreshTimer
        );


        dashboardRefreshTimer =
            null;
    }
}


/* =========================================================
   27. REQUIRED ELEMENTS
   ========================================================= */

function requiredElementsExist() {

    const elements = [
        loginScreen,
        loginForm,
        loginEmail,
        loginPassword,
        loginMessage,
        loginButton,

        dashboardScreen,
        authStatus,
        logoutButton,

        welcomeText,
        currentDate,

        vehiclesToday,
        revenueToday,
        waitingCount,
        washingCount,
        pendingPaymentCount,

        refreshPaymentsButton,
        paymentMessage,
        pendingPaymentsList,

        refreshQueueButton,
        queueMessage,
        queueList,

        recentBookingsList
    ];


    return !elements.some(
        (element) => !element
    );
}


/* =========================================================
   28. EVENT LISTENERS
   ========================================================= */

function registerEvents() {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );


    logoutButton.addEventListener(
        "click",
        handleLogout
    );


    refreshPaymentsButton
        .addEventListener(
            "click",
            refreshDashboard
        );


    refreshQueueButton
        .addEventListener(
            "click",
            refreshDashboard
        );


    queueFilterButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                handleQueueFilter
            );
        }
    );


    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                !document.hidden &&
                currentProfile
            ) {

                refreshDashboard();
            }
        }
    );
}


/* =========================================================
   29. SUPABASE INITIALISATION
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
   30. AUTH STATE
   ========================================================= */

function watchAuthentication() {

    glsSupabase.auth
        .onAuthStateChange(
            (event) => {

                if (
                    event === "SIGNED_OUT"
                ) {

                    showLoginScreen();
                }
            }
        );
}


/* =========================================================
   31. RESTORE SESSION
   ========================================================= */

async function restoreSession() {

    try {

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
            data &&
            data.session
        ) {

            await verifyUserProfile(
                data.session
            );

        }

        else {

            showLoginScreen();
        }

    }

    catch (error) {

        console.error(
            "GLS session restoration failed:",
            error
        );


        showLoginScreen(
            "Unable to restore your session. Please sign in again.",
            "error"
        );
    }
}


/* =========================================================
   32. INITIALISE APPLICATION
   ========================================================= */

async function initialiseDashboard() {

    if (!requiredElementsExist()) {

        console.error(
            "GLS Dashboard: required HTML elements are missing."
        );

        return;
    }


    updateCurrentDate();


    try {

        initialiseSupabase();

    }

    catch (error) {

        console.error(
            "GLS Supabase initialisation failed:",
            error
        );


        showLoginScreen(
            "Dashboard service is unavailable. Please refresh the page.",
            "error"
        );


        loginButton.disabled =
            true;


        return;
    }


    registerEvents();

    watchAuthentication();


    await restoreSession();


    console.log(
        "GLS Car Wash V2 operations dashboard ready."
    );
}


/* =========================================================
   33. START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseDashboard
    );

}

else {

    initialiseDashboard();
}
