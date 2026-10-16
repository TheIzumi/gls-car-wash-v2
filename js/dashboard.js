/* =========================================================
   GLS CAR WASH V2
   Operations Dashboard
   File: js/dashboard.js
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const GLS_SUPABASE_URL =
    "https://nfzlsjcrhaxvftpnokah.supabase.co";

const GLS_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_WJtd9t5EUqqIU1SM2UigiQ__wJsQVF8";

const GLS_TIMEZONE =
    "Asia/Kuala_Lumpur";


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

let glsSupabase = null;

let currentProfile = null;

let loginInProgress = false;
let logoutInProgress = false;
let dashboardLoading = false;
let paymentConfirmationInProgress = false;

let activeQueueFilter =
    "active";

let latestDashboardData = null;

let dashboardRefreshTimer = null;


/* =========================================================
   3. LOGIN ELEMENTS
   ========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );


/* =========================================================
   4. DASHBOARD ELEMENTS
   ========================================================= */

const dashboardScreen =
    document.getElementById(
        "dashboardScreen"
    );

const authStatus =
    document.getElementById(
        "authStatus"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const welcomeText =
    document.getElementById(
        "welcomeText"
    );

const currentDate =
    document.getElementById(
        "currentDate"
    );


/* =========================================================
   5. SUMMARY ELEMENTS
   ========================================================= */

const vehiclesToday =
    document.getElementById(
        "vehiclesToday"
    );

const revenueToday =
    document.getElementById(
        "revenueToday"
    );

const waitingCount =
    document.getElementById(
        "waitingCount"
    );

const washingCount =
    document.getElementById(
        "washingCount"
    );

const pendingPaymentCount =
    document.getElementById(
        "pendingPaymentCount"
    );


/* =========================================================
   6. PAYMENT ELEMENTS
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
   7. QUEUE ELEMENTS
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
   8. RECENT BOOKINGS
   ========================================================= */

const recentBookingsList =
    document.getElementById(
        "recentBookingsList"
    );


/* =========================================================
   9. FORMATTERS
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


/* =========================================================
   10. CURRENT DATE
   ========================================================= */

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
        ).format(
            new Date()
        );
}


/* =========================================================
   11. MESSAGE HELPER
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
        element.classList.add(
            type
        );
    }
}


/* =========================================================
   12. DOM HELPER
   ========================================================= */

function createElement(
    tag,
    className = "",
    text = ""
) {

    const element =
        document.createElement(
            tag
        );


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


function createStatusBadge(
    status
) {

    const value =
        String(
            status || "unknown"
        )
        .toLowerCase();


    return createElement(
        "span",
        `status-badge ${value}`,
        value
    );
}


/* =========================================================
   13. STOP AUTO REFRESH
   ========================================================= */

function stopDashboardRefresh() {

    if (
        dashboardRefreshTimer !== null
    ) {

        window.clearInterval(
            dashboardRefreshTimer
        );


        dashboardRefreshTimer =
            null;
    }
}


/* =========================================================
   14. START AUTO REFRESH
   ========================================================= */

function startDashboardRefresh() {

    stopDashboardRefresh();


    dashboardRefreshTimer =
        window.setInterval(
            function () {

                if (
                    currentProfile &&
                    dashboardScreen &&
                    !dashboardScreen.hidden
                ) {
                    refreshDashboard();
                }

            },
            20000
        );
}


/* =========================================================
   15. SHOW LOGIN
   ========================================================= */

function showLoginScreen(
    message = "",
    type = ""
) {

    currentProfile =
        null;

    latestDashboardData =
        null;


    stopDashboardRefresh();


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
}


/* =========================================================
   16. SHOW DASHBOARD
   ========================================================= */

function showDashboard(
    profile
) {

    currentProfile =
        profile;


    if (loginScreen) {
        loginScreen.hidden =
            true;
    }


    if (dashboardScreen) {
        dashboardScreen.hidden =
            false;
    }


    if (logoutButton) {

        logoutButton.hidden =
            false;

        logoutButton.disabled =
            false;

        logoutButton.textContent =
            "Log Out";
    }


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
   17. GET STAFF PROFILE
   ========================================================= */

async function getMyProfile() {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_my_gls_profile"
        );


    if (error) {
        throw error;
    }


    return data;
}


/* =========================================================
   18. VERIFY USER PROFILE
   ========================================================= */

async function verifyUserProfile(
    session
) {

    if (
        !session ||
        !session.user
    ) {

        showLoginScreen();

        return false;
    }


    try {

        const profile =
            await getMyProfile();


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
                "GLS account is not authorised."
            );
        }


        showDashboard(
            profile
        );


        /*
         * Dashboard data might fail until
         * get_gls_dashboard_data() is created.
         * That should NOT invalidate login.
         */

        await refreshDashboard();


        return true;

    }

    catch (error) {

        console.error(
            "GLS profile verification failed:",
            error
        );


        try {

            await glsSupabase.auth.signOut({
                scope:
                    "local"
            });

        }

        catch (
            signOutError
        ) {

            console.warn(
                "GLS cleanup sign-out failed:",
                signOutError
            );
        }


        showLoginScreen(
            "Unable to verify your GLS staff profile.",
            "error"
        );


        return false;
    }
}


/* =========================================================
   19. LOGIN BUSY STATE
   ========================================================= */

function setLoginBusy(
    isBusy
) {

    loginInProgress =
        isBusy;


    loginButton.disabled =
        isBusy;


    loginEmail.disabled =
        isBusy;


    loginPassword.disabled =
        isBusy;


    loginButton.textContent =
        isBusy
            ? "Signing In..."
            : "Sign In";
}


/* =========================================================
   20. LOGIN
   ========================================================= */

async function handleLogin(
    event
) {

    /*
     * CRITICAL:
     * Prevent native form submission.
     */

    event.preventDefault();


    if (
        loginInProgress ||
        !glsSupabase
    ) {
        return;
    }


    const email =
        loginEmail
            .value
            .trim();

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


    setLoginBusy(
        true
    );


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
            await glsSupabase
                .auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {
            throw error;
        }


        if (
            !data ||
            !data.session
        ) {

            throw new Error(
                "No active login session was created."
            );
        }


        await verifyUserProfile(
            data.session
        );

    }

    catch (error) {

        console.error(
            "GLS sign-in failed:",
            error
        );


        setMessage(
            loginMessage,
            "Sign-in failed. Check your email and password, then try again.",
            "error"
        );

    }

    finally {

        setLoginBusy(
            false
        );
    }
}


/* =========================================================
   21. LOGOUT
   ========================================================= */

async function handleLogout() {

    if (
        logoutInProgress ||
        !glsSupabase
    ) {
        return;
    }


    logoutInProgress =
        true;


    logoutButton.disabled =
        true;

    logoutButton.textContent =
        "Signing Out...";


    stopDashboardRefresh();


    try {

        const {
            error
        } =
            await glsSupabase
                .auth
                .signOut({
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
            "GLS sign-out failed:",
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

    finally {

        logoutInProgress =
            false;
    }
}


/* =========================================================
   22. GET DASHBOARD DATA
   ========================================================= */

async function getDashboardData() {

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
   23. SUMMARY
   ========================================================= */

function renderSummary(
    data
) {

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
   24. PENDING PAYMENT CARDS
   ========================================================= */

function renderPendingPayments(
    rows
) {

    pendingPaymentsList
        .replaceChildren();


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        pendingPaymentsList
            .appendChild(
                createElement(
                    "div",
                    "empty-state",
                    "No payments are waiting for verification."
                )
            );


        return;
    }


    rows.forEach(
        function (booking) {

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


            const metadata = [
                booking.customer_name ||
                    "Walk-in customer",

                booking.vehicle_type,

                booking.wash_type,

                booking.booking_no
            ];


            metadata.forEach(
                function (value) {

                    meta.appendChild(
                        createElement(
                            "span",
                            "",
                            value
                        )
                    );
                }
            );


            main.appendChild(
                meta
            );


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


            const methods = [
                [
                    "duitnow",
                    "DuitNow QR"
                ],
                [
                    "cash",
                    "Cash"
                ],
                [
                    "transfer",
                    "Transfer"
                ],
                [
                    "other",
                    "Other"
                ]
            ];


            methods.forEach(
                function (
                    [value, text]
                ) {

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
                function () {

                    confirmPayment(
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


            card.appendChild(
                main
            );


            card.appendChild(
                side
            );


            pendingPaymentsList
                .appendChild(
                    card
                );
        }
    );
}


/* =========================================================
   25. CONFIRM PAYMENT
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
        ].includes(
            paymentMethod
        )
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
            `${booking.plate_number}?`
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
            `Payment confirmed successfully for ${booking.booking_no}.`,
            "success"
        );


        await refreshDashboard();

    }

    catch (error) {

        console.error(
            "GLS payment confirmation failed:",
            error
        );


        setMessage(
            paymentMessage,
            "Unable to confirm payment. Please refresh and verify the booking status.",
            "error"
        );

    }

    finally {

        paymentConfirmationInProgress =
            false;


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
   QUEUE OPERATIONS
   ========================================================= */

async function updateQueueSt*tus(
    booking,
    action,
    *utton
) {

    if (
        !booki*g ||
        !booking.id ||
      * !action
    ) {
        return;
 *  }


    const actionLabels = {
 *      start: "Start Wash",
       *complete: "Complete Wash",
       *collect: "Mark as Collected"
    }*


    const actionMessages = {
  *     start:
            `Start was*ing ${booking.plate_number}?`,

  *     complete:
            `Mark $*booking.plate_number} as completed*`,

        collect:
            `*ark ${booking.plate_number} as col*ected?`
    };


    const confirm*d =
        window.confirm(
      *     actionMessages[action] ||
   *        "Continue with this queue *ction?"
        );


    if (!conf*rmed) {
        return;
    }


  * const originalText =
        butt*n.textContent;


    button.disabl*d =
        true;


    button.tex*Content =
        "Updating...";

*    setMessage(
        queueMessa*e,
        `Updating ${booking.que*e_no || booking.booking_no}...`,
 *      "info"
    );


    try {

 *      const {
            data,
  *         error
        } =
       *    await glsSupabase.rpc(
       *        "update_gls_queue_status",*                {
                *   p_booking_id:
                 *      booking.id,

               *    p_action:
                    *   action
                }
      *     );


        if (error) {
   *        throw error;
        }


 *      console.log(
            "GL* queue updated:",
            data*        );


        let successMe*sage =
            "Queue updated *uccessfully.";


        if (
    *       action === "start"
        * {

            successMessage =
 *              `${booking.queue_no}*· ${booking.plate_number} is now W*SHING.`;
        }


        else *f (
            action === "comple*e"
        ) {

            succes*Message =
                `${booki*g.queue_no} · ${booking.plate_numb*r} is now COMPLETED.`;
        }

*        else if (
            acti*n === "collect"
        ) {

     *      successMessage =
           *    `${booking.queue_no} · ${booki*g.plate_number} has been COLLECTED*`;
        }


        setMessage(*            queueMessage,
        *   successMessage,
            "su*cess"
        );


        await r*freshDashboard();

    }

    catc* (error) {

        console.error(*            "GLS queue update fail*d:",
            error
        );
*
        let message =
           *"Unable to update the queue status*";


        if (
            erro* &&
            typeof error.messa*e ===
                "string"
   *    ) {

            const errorMe*sage =
                error.messa*e
                    .toLowerCase*);


            if (
            *   errorMessage.includes(
        *           "payment must be confir*ed"
                )
            * {

                message =
    *               "Payment must be co*firmed before starting the wash.";*            }


            else i* (
                errorMessage.in*ludes(
                    "only w*iting vehicles"
                )
*           ) {

                me*sage =
                    "Only w*iting vehicles can start washing."*
            }


            else *f (
                errorMessage.i*cludes(
                    "only *ashing vehicles"
                )*            ) {

                m*ssage =
                    "Only *ehicles currently being washed can*be completed.";
            }


  *         else if (
               *errorMessage.includes(
           *        "only completed vehicles"
*               )
            ) {

*               message =
         *          "Only completed vehicles*can be marked as collected.";
    *       }


            else if (
 *              errorMessage.include*(
                    "cancelled"
*               )
            ) {

*               message =
         *          "Cancelled bookings cann*t be processed.";
            }


*           else if (
             *  errorMessage.includes(
         *          "not authorised"
       *        )
            ) {

       *        message =
                *   "Your account is not authorised*to manage the wash queue.";
      *     }
        }


        setMess*ge(
            queueMessage,
    *       message,
            "error*
        );

    }

    finally {
*        if (
            document.*ody.contains(
                butt*n
            )
        ) {

     *      button.disabled =
          *     false;


            button.t*xtContent =
                action*abels[action] ||
                o*iginalText;
        }
    }
}


/* =========================================================
   26. FILTER QUEUE
   ========================================================= */

function getFilteredQueue(
    rows
) {

    if (!Array.isArray(rows)) {
        return [];
    }


    if (
        activeQueueFilter ===
        "active"
    ) {

        return rows.filter(
            function (row) {

                return [
                    "waiting",
                    "washing"
                ].includes(
                    row.queue_status
                );
            }
        );
    }


    return rows.filter(
        function (row) {

            return (
                row.queue_status ===
                activeQueueFilter
            );
        }
    );
}


/* =========================================================
   27. RENDER QUEUE
   ========================================================= */

function renderQueue(
    rows
) {

    queueList.repla*eChildren();


    const filtered *
        getFilteredQueue(
       *    rows
        );


    if (
   *    filtered.length === 0
    ) {
*        queueList.appendChild(
   *        createElement(
           *    "div",
                "empty-*tate",
                "No vehicle* found for this queue filter."
   *        )
        );


        ret*rn;
    }


    filtered.forEach(
*       function (booking) {

     *      const card =
               *createElement(
                   *"article",
                    "op*ration-card"
                );


*           /* ====================*====================
             * LEFT SIDE
               ========*================================ **

            const main =
       *        createElement(
           *        "div",
                   *"operation-main"
                )*


            const topLine =
   *            createElement(
       *            "div",
               *    "operation-topline"
          *     );


            topLine.appe*dChild(
                createElem*nt(
                    "strong",
*                   "queue-number",*                    booking.queue_*o ||
                    "BOOKING"*                )
            );

*            topLine.appendChild(
 *              createElement(
     *              "span",
            *       "plate-number",
           *        booking.plate_number
     *          )
            );


     *      topLine.appendChild(
       *        createStatusBadge(
       *            booking.queue_status
 *              )
            );


 *          main.appendChild(
      *         topLine
            );


*           /* ====================*====================
             * META
               =============*=========================== */

  *         const meta =
            *   createElement(
                *   "div",
                    "ope*ation-meta"
                );


 *          const values = [
       *        booking.vehicle_type,
    *           booking.wash_type,
                formatCurrency(
                    booking.amount
                ),
                String(
                    booking.payment_status ||
                    ""
                ).toUpperCase()
            ];


            values.forEach(
                function (value) {

                    meta.appendChild(
                        createElement(
                            "span",
                            "",
                            value
                        )
                    );
                }
            );


            main.appendChild(
                meta
            );


            /* =========================================
               RIGHT SIDE
               ========================================= */

            const side =
                createElement(
                    "div",
                    "queue-card-side"
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


            const actions =
                createElement(
                    "div",
                    "operation-actions"
                );


            /* =========================================
               WAITING
               ========================================= */

            if (
                booking.queue_status ===
                "waiting"
            ) {

                /*
                 * PAID booking may start wash.
                 */

                if (
                    booking.payment_status ===
                    "paid"
                ) {

                    const startButton =
                        createElement(
                            "button",
                            "start-button",
                            "Start Wash"
                        );


                    startButton.type =
                        "button";


                    startButton.addEventListener(
                        "click",
                        function () {

                            updateQueueStatus(
                                booking,
                                "start",
                                startButton
                            );
                        }
                    );


                    actions.appendChild(
                        startButton
                    );

                }


                /*
                 * Unpaid/pending vehicle cannot start.
                 */

                else {

                    const paymentRequiredButton =
                        createElement(
                            "button",
                            "payment-required-button",
                            "Payment Required"
                        );


                    paymentRequiredButton.type =
                        "button";

                    paymentRequiredButton.disabled =
                        true;


                    paymentRequiredButton.title =
                        "Payment must be confirmed before starting the wash.";


                    actions.appendChild(
                        paymentRequiredButton
                    );
                }
            }


            /* =========================================
               WASHING
               ========================================= */

            else if (
                booking.queue_status ===
                "washing"
            ) {

                const completeButton =
                    createElement(
                        "button",
                        "complete-button",
                        "Complete"
                    );


                completeButton.type =
                    "button";


                completeButton.addEventListener(
                    "click",
                    function () {

                        updateQueueStatus(
                            booking,
                            "complete",
                            completeButton
                        );
                    }
                );


                actions.appendChild(
                    completeButton
                );
            }


            /* =========================================
               COMPLETED
               ========================================= */

            else if (
                booking.queue_status ===
                "completed"
            ) {

                const collectButton =
                    createElement(
                        "button",
                        "collect-button",
                        "Collected"
                    );


                collectButton.type =
                    "button";


                collectButton.addEventListener(
                    "click",
                    function () {

                        updateQueueStatus(
                            booking,
                            "collect",
                            collectButton
                        );
                    }
                );


                actions.appendChild(
                    collectButton
                );
            }


            side.appendChild(
                actions
            );


            card.appendChild(
                main
            );


            card.appendChild(
                side
            );


            queueList.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   28. RECENT BOOKINGS
   ========================================================= */

function renderRecentBookings(
    rows
) {

    recentBookingsList
        .replaceChildren();


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {

        recentBookingsList
            .appendChild(
                createElement(
                    "div",
                    "empty-state",
                    "No recent bookings."
                )
            );

        return;
    }


    rows.forEach(
        function (booking) {

            const card =
                createElement(
                    "article",
                    "operation-card"
                );


            /* =========================================
               LEFT SIDE
               ========================================= */

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


            const values = [
                booking.booking_no,
                booking.vehicle_type,
                booking.wash_type,
                formatMalaysiaDateTime(
                    booking.created_at
                )
            ];


            values.forEach(
                function (value) {

                    meta.appendChild(
                        createElement(
                            "span",
                            "",
                            value
                        )
                    );
                }
            );


            main.appendChild(
                meta
            );


            /* =========================================
               RIGHT SIDE
               ========================================= */

            const side =
                createElement(
                    "div",
                    "recent-booking-side"
                );


            const amount =
                createElement(
                    "div",
                    "operation-amount",
                    formatCurrency(
                        booking.amount
                    )
                );


            side.appendChild(
                amount
            );


            /* =========================================
               VIEW RECEIPT
               Only PAID bookings get this button
               ========================================= */

            if (
                booking.payment_status ===
                "paid"
            ) {

                const receiptButton =
                    createElement(
                        "button",
                        "view-receipt-button",
                        "View Receipt"
                    );


                receiptButton.type =
                    "button";


                receiptButton.addEventListener(
                    "click",
                    function () {

                        const receiptUrl =
                            `receipt.html?booking=${encodeURIComponent(
                                booking.id
                            )}`;


                        window.location.href =
                            receiptUrl;
                    }
                );


                side.appendChild(
                    receiptButton
                );
            }


            /* =========================================
               BUILD CARD
               ========================================= */

            card.appendChild(
                main
            );


            card.appendChild(
                side
            );


            recentBookingsList
                .appendChild(
                    card
                );
        }
    );
}


/* =========================================================
   29. DASHBOARD DATA ERROR
   ========================================================= */

function showDashboardDataError(
    error
) {

    console.error(
        "GLS dashboard refresh failed:",
        error
    );


    let message =
        "Unable to refresh dashboard data.";


    if (
        error &&
        typeof error.message ===
            "string" &&
        error.message.includes(
            "get_gls_dashboard_data"
        )
    ) {

        message =
            "Dashboard data service is not configured yet.";
    }


    setMessage(
        paymentMessage,
        message,
        "error"
    );


    setMessage(
        queueMessage,
        message,
        "error"
    );
}


/* =========================================================
   30. REFRESH DASHBOARD
   ========================================================= */

async function refreshDashboard() {

    if (
        !currentProfile ||
        !dashboardScreen ||
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


        latestDashboardData =
            data;


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
            paymentMessage,
            ""
        );


        setMessage(
            queueMessage,
            ""
        );

    }

    catch (error) {

        showDashboardDataError(
            error
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
   31. QUEUE FILTER
   ========================================================= */

function handleQueueFilter(
    event
) {

    const button =
        event.currentTarget;


    activeQueueFilter =
        button.dataset.status ||
        "active";


    queueFilterButtons.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item === button
            );
        }
    );


    if (
        latestDashboardData
    ) {

        renderQueue(
            latestDashboardData.queue ||
            []
        );
    }
}


/* =========================================================
   32. RESTORE SESSION
   ========================================================= */

async function restoreSession() {

    try {

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
            "GLS session restore failed:",
            error
        );


        showLoginScreen(
            "Unable to restore your session. Please sign in again.",
            "error"
        );
    }
}


/* =========================================================
   33. REGISTER EVENTS
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
        function (button) {

            button.addEventListener(
                "click",
                handleQueueFilter
            );
        }
    );


    document.addEventListener(
        "visibilitychange",
        function () {

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
   34. REQUIRED ELEMENT CHECK
   ========================================================= */

function requiredElementsExist() {

    const required = {
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
    };


    const missing = Object.entries(required)
        .filter(function ([name, element]) {
            return !element;
        })
        .map(function ([name]) {
            return name;
        });


    if (missing.length > 0) {

        console.error(
            "GLS Dashboard missing HTML elements:",
            missing
        );

        return false;
    }


    return true;
}


/* =========================================================
   35. SUPABASE INITIALISATION
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
   36. INITIALISE DASHBOARD
   ========================================================= */

async function initialiseDashboard() {

    updateCurrentDate();


    if (
        !requiredElementsExist()
    ) {

        console.error(
            "GLS Dashboard: required HTML elements are missing."
        );

        return;
    }


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


    /*
     * No onAuthStateChange listener here.
     *
     * Login, restore, and logout are handled
     * explicitly to keep the flow predictable.
     */

    registerEvents();


    await restoreSession();


    console.log(
        "GLS Car Wash V2 operations dashboard ready."
    );
}


/* =========================================================
   37. START APPLICATION
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
