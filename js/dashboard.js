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

const DASHBOARD_REFRESH_INTERVAL =
    20000;

const BOOKING_HISTORY_PAGE_SIZE =
    50;


let glsSupabase =
    null;


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

let currentProfile =
    null;

let latestDashboardData =
    null;


let loginInProgress =
    false;

let logoutInProgress =
    false;

let dashboardLoading =
    false;

let paymentConfirmationInProgress =
    false;

let queueActionInProgress =
    false;

let checkInInProgress =
    false;

let historyLoading =
    false;


let activeQueueFilter =
    "active";

let activeUpcomingFilter =
    "today";

let activeHistoryFilter =
    "all";


let historySearchValue =
    "";

let historyOffset =
    0;

let historyTotal =
    0;


let dashboardRefreshTimer =
    null;


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
   6. UPCOMING BOOKING ELEMENTS
   ========================================================= */

const upcomingBookingsPanel =
    document.getElementById(
        "upcomingBookingsPanel"
    );

const refreshUpcomingButton =
    document.getElementById(
        "refreshUpcomingButton"
    );

const upcomingBookingsMessage =
    document.getElementById(
        "upcomingBookingsMessage"
    );

const upcomingBookingsList =
    document.getElementById(
        "upcomingBookingsList"
    );

const upcomingFilterButtons =
    document.querySelectorAll(
        ".upcoming-filter"
    );

const upcomingTodayCount =
    document.getElementById(
        "upcomingTodayCount"
    );

const upcomingTomorrowCount =
    document.getElementById(
        "upcomingTomorrowCount"
    );

const upcomingSevenDaysCount =
    document.getElementById(
        "upcomingSevenDaysCount"
    );


/* =========================================================
   7. PAYMENT ELEMENTS
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
   8. QUEUE ELEMENTS
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
   9. RECENT BOOKINGS
   ========================================================= */

const recentBookingsList =
    document.getElementById(
        "recentBookingsList"
    );


/* =========================================================
   10. BOOKING HISTORY ELEMENTS
   ========================================================= */

const bookingHistoryPanel =
    document.getElementById(
        "bookingHistoryPanel"
    );

const bookingHistorySearchForm =
    document.getElementById(
        "bookingHistorySearchForm"
    );

const bookingHistorySearch =
    document.getElementById(
        "bookingHistorySearch"
    );

const bookingHistorySearchButton =
    document.getElementById(
        "bookingHistorySearchButton"
    );

const bookingHistoryClearButton =
    document.getElementById(
        "bookingHistoryClearButton"
    );

const bookingHistoryMessage =
    document.getElementById(
        "bookingHistoryMessage"
    );

const bookingHistorySummary =
    document.getElementById(
        "bookingHistorySummary"
    );

const bookingHistoryList =
    document.getElementById(
        "bookingHistoryList"
    );

const bookingHistoryPreviousButton =
    document.getElementById(
        "bookingHistoryPreviousButton"
    );

const bookingHistoryPageInfo =
    document.getElementById(
        "bookingHistoryPageInfo"
    );

const bookingHistoryNextButton =
    document.getElementById(
        "bookingHistoryNextButton"
    );

const historyFilterButtons =
    document.querySelectorAll(
        ".history-filter"
    );


/* =========================================================
   11. FORMATTERS
   ========================================================= */

const currencyFormatter =
    new Intl.NumberFormat(
        "en-MY",
        {
            style:
                "currency",

            currency:
                "MYR",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );


function formatCurrency(
    value
) {

    return currencyFormatter.format(
        Number(value) || 0
    );
}


/* =========================================================
   12. DATE HELPERS
   ========================================================= */

function getMalaysiaDateParts(
    date = new Date()
) {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    GLS_TIMEZONE,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        )
        .formatToParts(
            date
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


    return {
        year:
            Number(values.year),

        month:
            Number(values.month),

        day:
            Number(values.day)
    };
}


function getMalaysiaDateString(
    offsetDays = 0
) {

    const parts =
        getMalaysiaDateParts();


    const date =
        new Date(
            Date.UTC(
                parts.year,
                parts.month - 1,
                parts.day + offsetDays
            )
        );


    const year =
        date.getUTCFullYear();


    const month =
        String(
            date.getUTCMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getUTCDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
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
    ).format(
        date
    );
}


function formatBookingDate(
    value
) {

    if (!value) {
        return "—";
    }


    const parts =
        String(value)
            .split("-");


    if (
        parts.length !== 3
    ) {

        return value;
    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    const date =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );


    return new Intl.DateTimeFormat(
        "en-MY",
        {
            weekday:
                "short",

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            timeZone:
                "UTC"
        }
    ).format(
        date
    );
}


function formatBookingTime(
    value
) {

    if (!value) {
        return "—";
    }


    const match =
        String(value)
            .match(
                /^(\d{1,2}):(\d{2})/
            );


    if (!match) {
        return value;
    }


    const hours =
        Number(match[1]);

    const minutes =
        Number(match[2]);


    const date =
        new Date(
            Date.UTC(
                2000,
                0,
                1,
                hours,
                minutes
            )
        );


    return new Intl.DateTimeFormat(
        "en-MY",
        {
            hour:
                "2-digit",

            minute:
                "2-digit",

            hour12:
                true,

            timeZone:
                "UTC"
        }
    ).format(
        date
    );
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
        ).format(
            new Date()
        );
}


/* =========================================================
   13. MESSAGE HELPER
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
   14. DOM HELPERS
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
        ).toLowerCase();


    return createElement(
        "span",
        `status-badge ${value}`,
        value
    );
}


/* =========================================================
   15. AUTO REFRESH
   ========================================================= */

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
            DASHBOARD_REFRESH_INTERVAL
        );
}


/* =========================================================
   16. LOGIN SCREEN
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


    loginScreen.hidden =
        false;

    dashboardScreen.hidden =
        true;


    authStatus.textContent =
        "Please sign in";


    logoutButton.hidden =
        true;

    logoutButton.disabled =
        false;

    logoutButton.textContent =
        "Log Out";


    setMessage(
        loginMessage,
        message,
        type
    );
}


/* =========================================================
   17. SHOW DASHBOARD
   ========================================================= */

function showDashboard(
    profile
) {

    currentProfile =
        profile;


    loginScreen.hidden =
        true;

    dashboardScreen.hidden =
        false;


    logoutButton.hidden =
        false;

    logoutButton.disabled =
        false;


    const displayName =
        profile.full_name ||
        "GLS User";


    const displayRole =
        profile.role ===
        "admin"
            ? "Admin"
            : "Staff";


    authStatus.textContent =
        `${displayName} · ${displayRole}`;


    welcomeText.textContent =
        `Welcome back, ${displayName}.`;


    loginPassword.value =
        "";


    setMessage(
        loginMessage,
        ""
    );


    updateCurrentDate();

    startDashboardRefresh();
}


/* =========================================================
   18. STAFF PROFILE
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


        await refreshDashboard();


        return true;

    }

    catch (error) {

        console.error(
            "GLS profile verification failed:",
            error
        );


        try {

            await glsSupabase.auth
                .signOut({
                    scope:
                        "local"
                });

        }

        catch (signOutError) {

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
   19. LOGIN
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


async function handleLogin(
    event
) {

    event.preventDefault();


    if (
        loginInProgress ||
        !glsSupabase
    ) {

        return;
    }


    const email =
        loginEmail.value
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
            await glsSupabase.auth
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
   20. LOGOUT
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
            await glsSupabase.auth
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
   21. GET DASHBOARD DATA
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
   22. SUMMARY
   ========================================================= */

function renderSummary(
    data
) {

    const summary =
        data.summary ||
        {};


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
   23. UPCOMING COUNTS
   ========================================================= */

function updateUpcomingCounts(
    rows
) {

    const bookings =
        Array.isArray(rows)
            ? rows
            : [];


    const today =
        getMalaysiaDateString(0);

    const tomorrow =
        getMalaysiaDateString(1);

    const sevenDaysLater =
        getMalaysiaDateString(7);


    const todayCount =
        bookings.filter(
            function (booking) {

                return (
                    booking.booking_date ===
                    today
                );
            }
        ).length;


    const tomorrowCount =
        bookings.filter(
            function (booking) {

                return (
                    booking.booking_date ===
                    tomorrow
                );
            }
        ).length;


    const sevenDaysCount =
        bookings.filter(
            function (booking) {

                return (
                    booking.booking_date >=
                        today &&
                    booking.booking_date <=
                        sevenDaysLater
                );
            }
        ).length;


    upcomingTodayCount.textContent =
        String(todayCount);

    upcomingTomorrowCount.textContent =
        String(tomorrowCount);

    upcomingSevenDaysCount.textContent =
        String(sevenDaysCount);
}


/* =========================================================
   24. UPCOMING FILTER
   ========================================================= */

function getFilteredUpcomingBookings(
    rows
) {

    if (
        !Array.isArray(rows)
    ) {

        return [];
    }


    const today =
        getMalaysiaDateString(0);

    const tomorrow =
        getMalaysiaDateString(1);

    const sevenDaysLater =
        getMalaysiaDateString(7);


    if (
        activeUpcomingFilter ===
        "today"
    ) {

        return rows.filter(
            function (booking) {

                return (
                    booking.booking_date ===
                    today
                );
            }
        );
    }


    if (
        activeUpcomingFilter ===
        "tomorrow"
    ) {

        return rows.filter(
            function (booking) {

                return (
                    booking.booking_date ===
                    tomorrow
                );
            }
        );
    }


    return rows.filter(
        function (booking) {

            return (
                booking.booking_date >=
                    today &&
                booking.booking_date <=
                    sevenDaysLater
            );
        }
    );
}


/* =========================================================
   25. CHECK IN FUTURE BOOKING
   ========================================================= */

async function checkInUpcomingBooking(
    booking,
    button
) {

    if (
        checkInInProgress ||
        !booking ||
        !booking.id
    ) {

        return;
    }


    const confirmed =
        window.confirm(
            `Check in ${booking.plate_number} ` +
            `for ${formatBookingTime(
                booking.booking_time
            )}?`
        );


    if (!confirmed) {
        return;
    }


    checkInInProgress =
        true;


    const originalText =
        button.textContent;


    button.disabled =
        true;

    button.textContent =
        "Checking In...";


    setMessage(
        upcomingBookingsMessage,
        `Checking in ${booking.booking_no}...`,
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await glsSupabase.rpc(
                "check_in_gls_booking",
                {
                    p_booking_id:
                        booking.id
                }
            );


        if (error) {
            throw error;
        }


        setMessage(
            upcomingBookingsMessage,
            `${booking.plate_number} checked in as ${data.queue_no}.`,
            "success"
        );


        console.log(
            "GLS future booking checked in:",
            data
        );


        await refreshDashboard();

    }

    catch (error) {

        console.error(
            "GLS check-in failed:",
            error
        );


        let message =
            "Unable to check in this booking.";


        const value =
            String(
                error &&
                error.message
                    ? error.message
                    : ""
            ).toLowerCase();


        if (
            value.includes(
                "before its scheduled date"
            )
        ) {

            message =
                "This booking cannot be checked in before its scheduled date.";
        }

        else if (
            value.includes(
                "already been checked in"
            )
        ) {

            message =
                "This booking has already been checked in.";
        }


        setMessage(
            upcomingBookingsMessage,
            message,
            "error"
        );

    }

    finally {

        checkInInProgress =
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
   26. RENDER UPCOMING BOOKINGS
   ========================================================= */

function renderUpcomingBookings(
    rows
) {

    upcomingBookingsList
        .replaceChildren();


    updateUpcomingCounts(
        rows
    );


    const filtered =
        getFilteredUpcomingBookings(
            rows
        );


    if (
        filtered.length === 0
    ) {

        let message =
            "No scheduled bookings found.";


        if (
            activeUpcomingFilter ===
            "today"
        ) {

            message =
                "No scheduled bookings for today.";
        }

        else if (
            activeUpcomingFilter ===
            "tomorrow"
        ) {

            message =
                "No scheduled bookings for tomorrow.";
        }


        upcomingBookingsList
            .appendChild(
                createElement(
                    "div",
                    "empty-state",
                    message
                )
            );


        return;
    }


    const today =
        getMalaysiaDateString(0);


    filtered.forEach(
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
                    formatBookingTime(
                        booking.booking_time
                    )
                )
            );


            topLine.appendChild(
                createElement(
                    "span",
                    "plate-number",
                    booking.plate_number ||
                    "-"
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

                formatBookingDate(
                    booking.booking_date
                ),

                booking.customer_name ||
                    "Customer",

                booking.vehicle_type,

                booking.wash_type,

                booking.booking_no
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


            const checkInButton =
                createElement(
                    "button",
                    "start-button",
                    "Check In"
                );


            checkInButton.type =
                "button";


            if (
                booking.booking_date >
                today
            ) {

                checkInButton.disabled =
                    true;

                checkInButton.textContent =
                    "Not Due Yet";

                checkInButton.title =
                    "Check-in becomes available on the scheduled booking date.";

            }

            else {

                checkInButton
                    .addEventListener(
                        "click",
                        function () {

                            checkInUpcomingBooking(
                                booking,
                                checkInButton
                            );
                        }
                    );
            }


            actions.appendChild(
                checkInButton
            );


            side.appendChild(
                actions
            );


            card.appendChild(
                main
            );


            card.appendChild(
                side
            );


            upcomingBookingsList
                .appendChild(
                    card
                );
        }
    );
}


/* =========================================================
   27. PAYMENT VERIFICATION
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


    const paymentMethodLabels = {

        cash:
            "Customer selected: Cash",

        duitnow:
            "Customer selected: DuitNow QR",

        transfer:
            "Customer selected: Bank Transfer"
    };


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


            const values = [

                booking.customer_name ||
                    "Walk-in customer",

                booking.vehicle_type,

                booking.wash_type,

                paymentMethodLabels[
                    booking.selected_payment_method
                ] ||
                    "Payment method not recorded",

                booking.booking_no
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
                    "Bank Transfer"
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


            if (
                [
                    "cash",
                    "duitnow",
                    "transfer"
                ].includes(
                    booking.selected_payment_method
                )
            ) {

                methodSelect.value =
                    booking.selected_payment_method;

            }

            else {

                methodSelect.value =
                    "duitnow";
            }


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
   28. CONFIRM PAYMENT
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


    const labels = {

        cash:
            "CASH",

        duitnow:
            "DUITNOW QR",

        transfer:
            "BANK TRANSFER",

        other:
            "OTHER"
    };


    const confirmed =
        window.confirm(
            `Confirm ${formatCurrency(
                booking.amount
            )} ${labels[paymentMethod]} payment for ` +
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


        setMessage(
            paymentMessage,
            `Payment confirmed. Receipt ${data.receipt_no || ""} is ready.`,
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
            "Unable to confirm payment.",
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
   29. QUEUE OPERATION
   ========================================================= */

async function updateQueueStatus(
    booking,
    action,
    button
) {

    if (
        queueActionInProgress ||
        !booking ||
        !booking.id
    ) {

        return;
    }


    const messages = {

        start:
            `Start washing ${booking.plate_number}?`,

        complete:
            `Mark ${booking.plate_number} as completed?`,

        collect:
            `Mark ${booking.plate_number} as collected?`
    };


    if (
        !window.confirm(
            messages[action] ||
            "Continue?"
        )
    ) {

        return;
    }


    queueActionInProgress =
        true;


    const originalText =
        button.textContent;


    button.disabled =
        true;

    button.textContent =
        "Updating...";


    try {

        const {
            error
        } =
            await glsSupabase.rpc(
                "update_gls_queue_status",
                {
                    p_booking_id:
                        booking.id,

                    p_action:
                        action
                }
            );


        if (error) {
            throw error;
        }


        await refreshDashboard();

    }

    catch (error) {

        console.error(
            "GLS queue update failed:",
            error
        );


        setMessage(
            queueMessage,
            "Unable to update queue status.",
            "error"
        );

    }

    finally {

        queueActionInProgress =
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
   30. QUEUE FILTER
   ========================================================= */

function getFilteredQueue(
    rows
) {

    if (
        !Array.isArray(rows)
    ) {

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
   31. RENDER QUEUE
   ========================================================= */

function renderQueue(
    rows
) {

    queueList.replaceChildren();


    const filtered =
        getFilteredQueue(
            rows
        );


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
                String(
                    booking.payment_status ||
                    ""
                ).toUpperCase()
            ].forEach(
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


            if (
                booking.queue_status ===
                "waiting"
            ) {

                if (
                    booking.payment_status ===
                    "paid"
                ) {

                    const button =
                        createElement(
                            "button",
                            "start-button",
                            "Start Wash"
                        );


                    button.type =
                        "button";


                    button.addEventListener(
                        "click",
                        function () {

                            updateQueueStatus(
                                booking,
                                "start",
                                button
                            );
                        }
                    );


                    actions.appendChild(
                        button
                    );

                }

                else {

                    const button =
                        createElement(
                            "button",
                            "payment-required-button",
                            "Payment Required"
                        );


                    button.type =
                        "button";

                    button.disabled =
                        true;


                    actions.appendChild(
                        button
                    );
                }
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


                button.addEventListener(
                    "click",
                    function () {

                        updateQueueStatus(
                            booking,
                            "complete",
                            button
                        );
                    }
                );


                actions.appendChild(
                    button
                );
            }

            else if (
                booking.queue_status ===
                "completed"
            ) {

                const button =
                    createElement(
                        "button",
                        "collect-button",
                        "Collected"
                    );


                button.type =
                    "button";


                button.addEventListener(
                    "click",
                    function () {

                        updateQueueStatus(
                            booking,
                            "collect",
                            button
                        );
                    }
                );


                actions.appendChild(
                    button
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
   32. RECEIPT BUTTON HELPER
   ========================================================= */

function createReceiptButton(
    booking
) {

    if (
        !booking ||
        booking.payment_status !==
            "paid"
    ) {

        return null;
    }


    const button =
        createElement(
            "button",
            "view-receipt-button",
            "View Receipt"
        );


    button.type =
        "button";


    button.addEventListener(
        "click",
        function () {

            window.location.href =
                `receipt.html?booking=${encodeURIComponent(
                    booking.id
                )}`;
        }
    );


    return button;
}


/* =========================================================
   33. RECENT BOOKINGS
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
                    (
                        booking.booking_type ===
                        "Future Booking"
                            ? "SCHEDULED"
                            : "BOOKING"
                    )
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


            const dateValue =
                booking.booking_type ===
                    "Future Booking"
                    ? (
                        `${formatBookingDate(
                            booking.booking_date
                        )} · ` +
                        `${formatBookingTime(
                            booking.booking_time
                        )}`
                    )
                    : formatMalaysiaDateTime(
                        booking.created_at
                    );


            [
                booking.booking_no,
                booking.vehicle_type,
                booking.wash_type,
                dateValue
            ].forEach(
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
                    "recent-booking-side"
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


            const receiptButton =
                createReceiptButton(
                    booking
                );


            if (receiptButton) {

                side.appendChild(
                    receiptButton
                );
            }


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
   34. BOOKING HISTORY RPC
   ========================================================= */

async function getBookingHistory() {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "search_gls_booking_history",
            {
                p_search:
                    historySearchValue ||
                    null,

                p_status:
                    activeHistoryFilter,

                p_limit:
                    BOOKING_HISTORY_PAGE_SIZE,

                p_offset:
                    historyOffset
            }
        );


    if (error) {
        throw error;
    }


    if (!data) {

        throw new Error(
            "No history data returned."
        );
    }


    return data;
}


/* =========================================================
   35. RENDER BOOKING HISTORY
   ========================================================= */

function renderBookingHistory(
    payload
) {

    bookingHistoryList
        .replaceChildren();


    const results =
        Array.isArray(
            payload.results
        )
            ? payload.results
            : [];


    historyTotal =
        Number(
            payload.total
        ) || 0;


    const page =
        Math.floor(
            historyOffset /
            BOOKING_HISTORY_PAGE_SIZE
        ) + 1;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                historyTotal /
                BOOKING_HISTORY_PAGE_SIZE
            )
        );


    bookingHistoryPageInfo.textContent =
        `Page ${page} of ${totalPages}`;


    bookingHistoryPreviousButton.disabled =
        historyOffset <= 0;


    bookingHistoryNextButton.disabled =
        (
            historyOffset +
            BOOKING_HISTORY_PAGE_SIZE
        ) >= historyTotal;


    if (
        historyTotal === 0
    ) {

        bookingHistorySummary.textContent =
            historySearchValue
                ? `No records found for "${historySearchValue}".`
                : "No booking records found.";


        bookingHistoryList
            .appendChild(
                createElement(
                    "div",
                    "empty-state",
                    "No matching bookings."
                )
            );


        return;
    }


    const firstRecord =
        historyOffset + 1;


    const lastRecord =
        Math.min(
            historyOffset +
                results.length,
            historyTotal
        );


    bookingHistorySummary.textContent =
        `Showing ${firstRecord}-${lastRecord} of ${historyTotal} booking records.`;


    results.forEach(
        function (booking) {

            const card =
                createElement(
                    "article",
                    "operation-card history-card"
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
                    (
                        booking.booking_type ===
                        "Future Booking"
                            ? "SCHEDULED"
                            : "BOOKING"
                    )
                )
            );


            topLine.appendChild(
                createElement(
                    "span",
                    "plate-number",
                    booking.plate_number ||
                    "-"
                )
            );


            topLine.appendChild(
                createStatusBadge(
                    booking.payment_status
                )
            );


            if (
                booking.queue_status
            ) {

                topLine.appendChild(
                    createStatusBadge(
                        booking.queue_status
                    )
                );
            }


            main.appendChild(
                topLine
            );


            const meta =
                createElement(
                    "div",
                    "operation-meta"
                );


            const customer =
                booking.customer_name ||
                "Customer name not provided";


            const visit =
                booking.booking_type ===
                    "Future Booking"
                    ? (
                        `${formatBookingDate(
                            booking.booking_date
                        )} · ` +
                        `${formatBookingTime(
                            booking.booking_time
                        )}`
                    )
                    : formatMalaysiaDateTime(
                        booking.created_at
                    );


            [
                booking.booking_no,
                customer,
                booking.vehicle_type,
                booking.wash_type,
                visit
            ].forEach(
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
                    "recent-booking-side"
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


            const receiptButton =
                createReceiptButton(
                    booking
                );


            if (receiptButton) {

                side.appendChild(
                    receiptButton
                );
            }


            card.appendChild(
                main
            );


            card.appendChild(
                side
            );


            bookingHistoryList
                .appendChild(
                    card
                );
        }
    );
}


/* =========================================================
   36. SEARCH BOOKING HISTORY
   ========================================================= */

async function searchBookingHistory() {

    if (
        historyLoading ||
        !currentProfile
    ) {

        return;
    }


    historyLoading =
        true;


    bookingHistorySearchButton.disabled =
        true;

    bookingHistoryClearButton.disabled =
        true;

    bookingHistoryPreviousButton.disabled =
        true;

    bookingHistoryNextButton.disabled =
        true;


    setMessage(
        bookingHistoryMessage,
        "Searching booking records...",
        "info"
    );


    try {

        const data =
            await getBookingHistory();


        renderBookingHistory(
            data
        );


        setMessage(
            bookingHistoryMessage,
            ""
        );

    }

    catch (error) {

        console.error(
            "GLS booking history search failed:",
            error
        );


        setMessage(
            bookingHistoryMessage,
            "Unable to search booking history.",
            "error"
        );

    }

    finally {

        historyLoading =
            false;


        bookingHistorySearchButton.disabled =
            false;

        bookingHistoryClearButton.disabled =
            false;


        /*
         * Pagination state is recalculated
         * after a successful render.
         *
         * If search failed, allow Previous when
         * current offset is not zero.
         */

        if (
            historyTotal === 0
        ) {

            bookingHistoryPreviousButton.disabled =
                true;

            bookingHistoryNextButton.disabled =
                true;
        }
    }
}


/* =========================================================
   37. HISTORY SEARCH SUBMIT
   ========================================================= */

function handleBookingHistorySearch(
    event
) {

    event.preventDefault();


    historySearchValue =
        bookingHistorySearch.value
            .trim();


    historyOffset =
        0;


    searchBookingHistory();
}


/* =========================================================
   38. CLEAR HISTORY SEARCH
   ========================================================= */

function clearBookingHistorySearch() {

    bookingHistorySearch.value =
        "";

    historySearchValue =
        "";

    activeHistoryFilter =
        "all";

    historyOffset =
        0;

    historyTotal =
        0;


    historyFilterButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset
                    .historyFilter ===
                    "all"
            );
        }
    );


    bookingHistoryList
        .replaceChildren();


    bookingHistorySummary.textContent =
        "Search or select a filter to view booking records.";


    bookingHistoryPageInfo.textContent =
        "Page 1";


    bookingHistoryPreviousButton.disabled =
        true;

    bookingHistoryNextButton.disabled =
        true;


    setMessage(
        bookingHistoryMessage,
        ""
    );
}


/* =========================================================
   39. HISTORY FILTER
   ========================================================= */

function handleHistoryFilter(
    event
) {

    const button =
        event.currentTarget;


    activeHistoryFilter =
        button.dataset
            .historyFilter ||
        "all";


    historyOffset =
        0;


    historySearchValue =
        bookingHistorySearch.value
            .trim();


    historyFilterButtons.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item === button
            );
        }
    );


    searchBookingHistory();
}


/* =========================================================
   40. HISTORY PREVIOUS PAGE
   ========================================================= */

function showPreviousHistoryPage() {

    if (
        historyLoading ||
        historyOffset <= 0
    ) {

        return;
    }


    historyOffset =
        Math.max(
            0,
            historyOffset -
            BOOKING_HISTORY_PAGE_SIZE
        );


    searchBookingHistory();
}


/* =========================================================
   41. HISTORY NEXT PAGE
   ========================================================= */

function showNextHistoryPage() {

    if (
        historyLoading ||
        historyOffset +
            BOOKING_HISTORY_PAGE_SIZE >=
            historyTotal
    ) {

        return;
    }


    historyOffset +=
        BOOKING_HISTORY_PAGE_SIZE;


    searchBookingHistory();
}


/* =========================================================
   42. UPCOMING FILTER HANDLER
   ========================================================= */

function handleUpcomingFilter(
    event
) {

    const button =
        event.currentTarget;


    activeUpcomingFilter =
        button.dataset
            .upcomingFilter ||
        "today";


    upcomingFilterButtons.forEach(
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

        renderUpcomingBookings(
            latestDashboardData
                .upcoming_bookings ||
            []
        );
    }
}


/* =========================================================
   43. QUEUE FILTER HANDLER
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
   44. DASHBOARD DATA ERROR
   ========================================================= */

function showDashboardDataError(
    error
) {

    console.error(
        "GLS dashboard refresh failed:",
        error
    );


    setMessage(
        upcomingBookingsMessage,
        "Unable to refresh upcoming bookings.",
        "error"
    );


    setMessage(
        paymentMessage,
        "Unable to refresh payment data.",
        "error"
    );


    setMessage(
        queueMessage,
        "Unable to refresh queue data.",
        "error"
    );
}


/* =========================================================
   45. REFRESH DASHBOARD
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


    refreshUpcomingButton.disabled =
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


        renderUpcomingBookings(
            data.upcoming_bookings ||
            []
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
            upcomingBookingsMessage,
            ""
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


        refreshUpcomingButton.disabled =
            false;

        refreshPaymentsButton.disabled =
            false;

        refreshQueueButton.disabled =
            false;
    }
}


/* =========================================================
   46. RESTORE SESSION
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
   47. REQUIRED ELEMENT CHECK
   ========================================================= */

function requiredElementsExist() {

    const requiredElements = {

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

        upcomingBookingsPanel,
        refreshUpcomingButton,
        upcomingBookingsMessage,
        upcomingBookingsList,
        upcomingTodayCount,
        upcomingTomorrowCount,
        upcomingSevenDaysCount,

        refreshPaymentsButton,
        paymentMessage,
        pendingPaymentsList,

        refreshQueueButton,
        queueMessage,
        queueList,

        recentBookingsList,

        bookingHistoryPanel,
        bookingHistorySearchForm,
        bookingHistorySearch,
        bookingHistorySearchButton,
        bookingHistoryClearButton,
        bookingHistoryMessage,
        bookingHistorySummary,
        bookingHistoryList,
        bookingHistoryPreviousButton,
        bookingHistoryPageInfo,
        bookingHistoryNextButton
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
            "GLS Dashboard missing HTML elements:",
            missing
        );


        return false;
    }


    return true;
}


/* =========================================================
   48. EVENT LISTENERS
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


    refreshUpcomingButton
        .addEventListener(
            "click",
            refreshDashboard
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


    upcomingFilterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                handleUpcomingFilter
            );
        }
    );


    queueFilterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                handleQueueFilter
            );
        }
    );


    bookingHistorySearchForm
        .addEventListener(
            "submit",
            handleBookingHistorySearch
        );


    bookingHistoryClearButton
        .addEventListener(
            "click",
            clearBookingHistorySearch
        );


    historyFilterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                handleHistoryFilter
            );
        }
    );


    bookingHistoryPreviousButton
        .addEventListener(
            "click",
            showPreviousHistoryPage
        );


    bookingHistoryNextButton
        .addEventListener(
            "click",
            showNextHistoryPage
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
   49. SUPABASE
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
   50. INITIALISE
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


    registerEvents();


    await restoreSession();


    console.log(
        "GLS Car Wash V2 operations dashboard ready."
    );
}


/* =========================================================
   51. START APPLICATION
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
