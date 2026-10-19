/* =========================================================
   GLS CAR WASH MANAGEMENT SYSTEM V3
   Mobile / Tablet Operations Application
   File: v3/js/app.js
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


let glsSupabase =
    null;


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

let currentProfile =
    null;

let newJobSetup =
    null;

let selectedService =
    null;

let selectedCustomerVehicle =
    null;

let currentPricePreview =
    null;

let loginInProgress =
    false;

let searchInProgress =
    false;

let priceCalculationInProgress =
    false;

let createJobInProgress =
    false;

let pricingSaveInProgress =
    false;


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
   4. HEADER ELEMENTS
   ========================================================= */

const headerUser =
    document.getElementById(
        "headerUser"
    );

const headerUserName =
    document.getElementById(
        "headerUserName"
    );

const headerUserRole =
    document.getElementById(
        "headerUserRole"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   5. MAIN APPLICATION
   ========================================================= */

const appScreen =
    document.getElementById(
        "appScreen"
    );

const mainNavigation =
    document.getElementById(
        "mainNavigation"
    );

const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );

const adminNavigationButton =
    document.getElementById(
        "adminNavigationButton"
    );

const applicationScreens =
    document.querySelectorAll(
        ".application-screen"
    );


/* =========================================================
   6. OPERATIONS ELEMENTS
   ========================================================= */

const operationsScreen =
    document.getElementById(
        "operationsScreen"
    );

const welcomeHeading =
    document.getElementById(
        "welcomeHeading"
    );

const operationsDate =
    document.getElementById(
        "operationsDate"
    );

const refreshOperationsButton =
    document.getElementById(
        "refreshOperationsButton"
    );

const newJobButton =
    document.getElementById(
        "newJobButton"
    );

const quickSearchButton =
    document.getElementById(
        "quickSearchButton"
    );

const waitingCount =
    document.getElementById(
        "waitingCount"
    );

const washingCount =
    document.getElementById(
        "washingCount"
    );

const readyCount =
    document.getElementById(
        "readyCount"
    );

const closedCount =
    document.getElementById(
        "closedCount"
    );

const operationsMessage =
    document.getElementById(
        "operationsMessage"
    );

const jobsList =
    document.getElementById(
        "jobsList"
    );

const jobFilterButtons =
    document.querySelectorAll(
        ".job-filter"
    );


/* =========================================================
   7. NEW JOB ELEMENTS
   ========================================================= */

const newJobScreen =
    document.getElementById(
        "newJobScreen"
    );

const newJobBackButton =
    document.getElementById(
        "newJobBackButton"
    );

const pricingWarning =
    document.getElementById(
        "pricingWarning"
    );

const customerVehicleSearchForm =
    document.getElementById(
        "customerVehicleSearchForm"
    );

const customerVehicleSearch =
    document.getElementById(
        "customerVehicleSearch"
    );

const customerVehicleSearchButton =
    document.getElementById(
        "customerVehicleSearchButton"
    );

const customerVehicleSearchMessage =
    document.getElementById(
        "customerVehicleSearchMessage"
    );

const customerVehicleResults =
    document.getElementById(
        "customerVehicleResults"
    );

const newJobForm =
    document.getElementById(
        "newJobForm"
    );

const selectedCustomerId =
    document.getElementById(
        "selectedCustomerId"
    );

const selectedVehicleId =
    document.getElementById(
        "selectedVehicleId"
    );

const customerPhone =
    document.getElementById(
        "customerPhone"
    );

const customerName =
    document.getElementById(
        "customerName"
    );

const customerNotes =
    document.getElementById(
        "customerNotes"
    );

const plateNumber =
    document.getElementById(
        "plateNumber"
    );

const vehicleModel =
    document.getElementById(
        "vehicleModel"
    );

const vehicleColour =
    document.getElementById(
        "vehicleColour"
    );

const vehicleCategory =
    document.getElementById(
        "vehicleCategory"
    );

const vehicleNotes =
    document.getElementById(
        "vehicleNotes"
    );

const serviceOptions =
    document.getElementById(
        "serviceOptions"
    );

const addOnOptions =
    document.getElementById(
        "addOnOptions"
    );

const jobNotes =
    document.getElementById(
        "jobNotes"
    );

const jobTotalAmount =
    document.getElementById(
        "jobTotalAmount"
    );

const priceBreakdown =
    document.getElementById(
        "priceBreakdown"
    );

const seasonalPricingNotice =
    document.getElementById(
        "seasonalPricingNotice"
    );

const newJobMessage =
    document.getElementById(
        "newJobMessage"
    );

const createJobButton =
    document.getElementById(
        "createJobButton"
    );


/* =========================================================
   8. SEARCH ELEMENTS
   ========================================================= */

const searchScreen =
    document.getElementById(
        "searchScreen"
    );

const globalSearchForm =
    document.getElementById(
        "globalSearchForm"
    );

const globalSearchInput =
    document.getElementById(
        "globalSearchInput"
    );

const globalSearchButton =
    document.getElementById(
        "globalSearchButton"
    );

const globalSearchMessage =
    document.getElementById(
        "globalSearchMessage"
    );

const globalSearchResults =
    document.getElementById(
        "globalSearchResults"
    );


/* =========================================================
   9. ADMIN ELEMENTS
   ========================================================= */

const adminScreen =
    document.getElementById(
        "adminScreen"
    );

const pricingManagementButton =
    document.getElementById(
        "pricingManagementButton"
    );

const pricingScreen =
    document.getElementById(
        "pricingScreen"
    );

const pricingBackButton =
    document.getElementById(
        "pricingBackButton"
    );

const pricingSetupStatus =
    document.getElementById(
        "pricingSetupStatus"
    );

const pricingMessage =
    document.getElementById(
        "pricingMessage"
    );

const servicePricingList =
    document.getElementById(
        "servicePricingList"
    );

const addonPricingList =
    document.getElementById(
        "addonPricingList"
    );


/* =========================================================
   10. FORMATTERS
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


function formatMalaysiaDateTime(
    value = new Date()
) {

    return new Intl.DateTimeFormat(
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
        value
    );
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
   12. SCREEN NAVIGATION
   ========================================================= */

function showApplicationScreen(
    screen
) {

    applicationScreens.forEach(
        function (item) {

            item.hidden =
                item !== screen;
        }
    );


    if (screen) {

        window.scrollTo({
            top:
                0,

            behavior:
                "smooth"
        });
    }
}


function setActiveNavigation(
    screenId
) {

    navButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.screen ===
                    screenId
            );
        }
    );
}


function navigateToScreen(
    screenId
) {

    const screen =
        document.getElementById(
            screenId
        );


    if (!screen) {
        return;
    }


    if (
        screenId ===
            "adminScreen" &&
        (
            !currentProfile ||
            currentProfile.role !==
                "admin"
        )
    ) {

        return;
    }


    showApplicationScreen(
        screen
    );


    setActiveNavigation(
        screenId
    );
}


/* =========================================================
   13. LOGIN / APP STATE
   ========================================================= */

function showLoginScreen(
    message = "",
    type = ""
) {

    currentProfile =
        null;


    loginScreen.hidden =
        false;

    appScreen.hidden =
        true;

    headerUser.hidden =
        true;


    setMessage(
        loginMessage,
        message,
        type
    );
}


function showApplication(
    profile
) {

    currentProfile =
        profile;


    loginScreen.hidden =
        true;

    appScreen.hidden =
        false;

    headerUser.hidden =
        false;


    headerUserName.textContent =
        profile.full_name ||
        "GLS Staff";


    headerUserRole.textContent =
        String(
            profile.role ||
            "staff"
        ).toUpperCase();


    adminNavigationButton.hidden =
        profile.role !==
        "admin";


    welcomeHeading.textContent =
        `Hello, ${
            profile.full_name ||
            "GLS Staff"
        }`;


    operationsDate.textContent =
        formatMalaysiaDateTime();


    navigateToScreen(
        "operationsScreen"
    );
}


/* =========================================================
   14. STAFF PROFILE
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


async function verifySession(
    session
) {

    if (
        !session ||
        !session.user
    ) {

        showLoginScreen();

        return false;
    }


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

        await glsSupabase.auth
            .signOut({
                scope:
                    "local"
            });


        showLoginScreen(
            "This account is not authorised to access GLS operations.",
            "error"
        );


        return false;
    }


    showApplication(
        profile
    );


    return true;
}


/* =========================================================
   15. LOGIN
   ========================================================= */

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


    loginInProgress =
        true;


    loginButton.disabled =
        true;

    loginEmail.disabled =
        true;

    loginPassword.disabled =
        true;

    loginButton.textContent =
        "Signing In...";


    setMessage(
        loginMessage,
        "Verifying your staff account...",
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
                "No login session was created."
            );
        }


        const authorised =
            await verifySession(
                data.session
            );


        if (authorised) {

            loginPassword.value =
                "";

            setMessage(
                loginMessage,
                ""
            );


            await loadNewJobSetup();

        }

    }

    catch (error) {

        console.error(
            "GLS V3 sign-in failed:",
            error
        );


        setMessage(
            loginMessage,
            "Sign-in failed. Check your email and password.",
            "error"
        );

    }

    finally {

        loginInProgress =
            false;


        loginButton.disabled =
            false;

        loginEmail.disabled =
            false;

        loginPassword.disabled =
            false;

        loginButton.textContent =
            "Sign In";
    }
}


/* =========================================================
   16. LOGOUT
   ========================================================= */

async function handleLogout() {

    logoutButton.disabled =
        true;

    logoutButton.textContent =
        "Signing Out...";


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


        resetNewJob();

        newJobSetup =
            null;


        showLoginScreen(
            "Signed out successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "GLS V3 sign-out failed:",
            error
        );


        alert(
            "Unable to sign out. Please try again."
        );

    }

    finally {

        logoutButton.disabled =
            false;

        logoutButton.textContent =
            "Log Out";
    }
}


/* =========================================================
   17. NEW JOB SETUP
   ========================================================= */

async function loadNewJobSetup() {

    if (!currentProfile) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await glsSupabase.rpc(
                "get_v3_new_job_setup"
            );


        if (error) {
            throw error;
        }


        newJobSetup =
            data;


        renderVehicleCategories();

        renderServiceOptions();

        renderAddOnOptions();

        updatePricingWarning();


        if (
            currentProfile.role ===
            "admin"
        ) {

            renderAdminPricing();
        }

    }

    catch (error) {

        console.error(
            "GLS V3 setup loading failed:",
            error
        );


        setMessage(
            operationsMessage,
            "Unable to load V3 configuration.",
            "error"
        );
    }
}


/* =========================================================
   18. VEHICLE CATEGORIES
   ========================================================= */

function renderVehicleCategories() {

    vehicleCategory.replaceChildren();


    const placeholder =
        document.createElement(
            "option"
        );


    placeholder.value =
        "";

    placeholder.textContent =
        "Select Category";


    vehicleCategory.appendChild(
        placeholder
    );


    const categories =
        Array.isArray(
            newJobSetup &&
            newJobSetup.vehicle_categories
        )
            ? newJobSetup
                .vehicle_categories
            : [];


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;

            option.textContent =
                category;


            vehicleCategory.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   19. GET SERVICE PRICE
   ========================================================= */

function getCurrentServicePrice(
    service,
    category
) {

    if (
        !service ||
        !category ||
        !Array.isArray(
            service.prices
        )
    ) {

        return null;
    }


    return (
        service.prices.find(
            function (price) {

                return (
                    price.vehicle_category ===
                    category
                );
            }
        ) ||
        null
    );
}


/* =========================================================
   20. SERVICES
   ========================================================= */

function renderServiceOptions() {

    serviceOptions
        .replaceChildren();


    const services =
        Array.isArray(
            newJobSetup &&
            newJobSetup.services
        )
            ? newJobSetup.services
            : [];


    if (
        services.length === 0
    ) {

        serviceOptions.appendChild(
            createElement(
                "div",
                "empty-state",
                "No active services are configured."
            )
        );


        return;
    }


    services.forEach(
        function (service) {

            const button =
                createElement(
                    "button",
                    "selection-card"
                );


            button.type =
                "button";


            const name =
                createElement(
                    "strong",
                    "",
                    service.name
                );


            const description =
                createElement(
                    "p",
                    "",
                    service.description ||
                    ""
                );


            const price =
                createElement(
                    "span",
                    "service-price"
                );


            const category =
                vehicleCategory.value;


            const configuredPrice =
                getCurrentServicePrice(
                    service,
                    category
                );


            price.textContent =
                configuredPrice
                    ? formatCurrency(
                        configuredPrice.amount
                    )
                    : (
                        category
                            ? "Price not configured"
                            : "Select vehicle category"
                    );


            button.appendChild(
                name
            );

            button.appendChild(
                description
            );

            button.appendChild(
                price
            );


            button.addEventListener(
                "click",
                async function () {

                    selectedService =
                        service;


                    document
                        .querySelectorAll(
                            ".selection-card"
                        )
                        .forEach(
                            function (item) {

                                item.classList.toggle(
                                    "selected",
                                    item === button
                                );
                            }
                        );


                    await refreshPricePreview();
                }
            );


            serviceOptions
                .appendChild(
                    button
                );
        }
    );
}


/* =========================================================
   21. ADD-ONS
   ========================================================= */

function renderAddOnOptions() {

    addOnOptions
        .replaceChildren();


    const addOns =
        Array.isArray(
            newJobSetup &&
            newJobSetup.add_ons
        )
            ? newJobSetup.add_ons
            : [];


    if (
        addOns.length === 0
    ) {

        addOnOptions.appendChild(
            createElement(
                "div",
                "empty-state",
                "No add-ons are configured."
            )
        );


        return;
    }


    addOns.forEach(
        function (addOn) {

            const card =
                createElement(
                    "div",
                    "addon-card"
                );


            card.dataset.addonId =
                addOn.id;


            const header =
                createElement(
                    "div",
                    "addon-card-header"
                );


            const label =
                createElement(
                    "label",
                    "addon-checkbox-label"
                );


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";

            checkbox.className =
                "addon-checkbox";


            const title =
                createElement(
                    "strong",
                    "",
                    addOn.name
                );


            label.appendChild(
                checkbox
            );

            label.appendChild(
                title
            );


            const amount =
                createElement(
                    "span",
                    "addon-price",
                    addOn.allow_custom_amount
                        ? "Custom"
                        : formatCurrency(
                            addOn.default_amount
                        )
                );


            header.appendChild(
                label
            );

            header.appendChild(
                amount
            );


            card.appendChild(
                header
            );


            if (
                addOn.description
            ) {

                card.appendChild(
                    createElement(
                        "p",
                        "addon-description",
                        addOn.description
                    )
                );
            }


            if (
                addOn.allow_custom_amount
            ) {

                const customFields =
                    createElement(
                        "div",
                        "addon-custom-fields"
                    );


                customFields.hidden =
                    true;


                const customAmount =
                    document.createElement(
                        "input"
                    );


                customAmount.type =
                    "number";

                customAmount.min =
                    "0";

                customAmount.step =
                    "0.01";

                customAmount.inputMode =
                    "decimal";

                customAmount.placeholder =
                    "Amount (RM)";

                customAmount.className =
                    "addon-custom-amount";


                const description =
                    document.createElement(
                        "input"
                    );


                description.type =
                    "text";

                description.maxLength =
                    200;

                description.placeholder =
                    addOn.code ===
                        "OTHER"
                        ? "Charge description"
                        : "Description (optional)";

                description.className =
                    "addon-custom-description";


                customFields.appendChild(
                    customAmount
                );

                customFields.appendChild(
                    description
                );


                card.appendChild(
                    customFields
                );


                checkbox.addEventListener(
                    "change",
                    function () {

                        customFields.hidden =
                            !checkbox.checked;


                        refreshPricePreview();
                    }
                );


                customAmount.addEventListener(
                    "input",
                    refreshPricePreview
                );


                description.addEventListener(
                    "input",
                    function () {

                        updateCreateJobButton();
                    }
                );

            }

            else {

                checkbox.addEventListener(
                    "change",
                    refreshPricePreview
                );
            }


            addOnOptions.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   22. SELECTED ADD-ONS PAYLOAD
   ========================================================= */

function buildAddOnPayload() {

    const result =
        [];


    document
        .querySelectorAll(
            ".addon-card"
        )
        .forEach(
            function (card) {

                const checkbox =
                    card.querySelector(
                        ".addon-checkbox"
                    );


                if (
                    !checkbox ||
                    !checkbox.checked
                ) {

                    return;
                }


                const addOn =
                    newJobSetup.add_ons
                        .find(
                            function (item) {

                                return (
                                    item.id ===
                                    card.dataset.addonId
                                );
                            }
                        );


                if (!addOn) {
                    return;
                }


                const payload = {
                    id:
                        addOn.id
                };


                if (
                    addOn.allow_custom_amount
                ) {

                    const amountInput =
                        card.querySelector(
                            ".addon-custom-amount"
                        );


                    const descriptionInput =
                        card.querySelector(
                            ".addon-custom-description"
                        );


                    payload.amount =
                        amountInput
                            ? Number(
                                amountInput.value
                            )
                            : NaN;


                    if (
                        descriptionInput &&
                        descriptionInput.value
                            .trim()
                    ) {

                        payload.description =
                            descriptionInput.value
                                .trim();
                    }
                }


                result.push(
                    payload
                );
            }
        );


    return result;
}


/* =========================================================
   23. PRICING WARNING
   ========================================================= */

function updatePricingWarning() {

    const pricingReady =
        Boolean(
            newJobSetup &&
            newJobSetup.pricing &&
            newJobSetup.pricing.ready
        );


    pricingWarning.hidden =
        pricingReady;


    updateCreateJobButton();
}


/* =========================================================
   24. PRICE PREVIEW
   ========================================================= */

async function refreshPricePreview() {

    if (
        priceCalculationInProgress
    ) {

        return;
    }


    const vehicleId =
        selectedVehicleId.value;


    if (
        !vehicleId ||
        !selectedService
    ) {

        currentPricePreview =
            null;


        renderPricePreview(
            null
        );


        updateCreateJobButton();

        return;
    }


    priceCalculationInProgress =
        true;


    try {

        const {
            data,
            error
        } =
            await glsSupabase.rpc(
                "calculate_v3_job_price",
                {
                    p_vehicle_id:
                        vehicleId,

                    p_service_id:
                        selectedService.id,

                    p_add_ons:
                        buildAddOnPayload()
                }
            );


        if (error) {
            throw error;
        }


        currentPricePreview =
            data;


        renderPricePreview(
            data
        );


        setMessage(
            newJobMessage,
            ""
        );

    }

    catch (error) {

        currentPricePreview =
            null;


        renderPricePreview(
            null
        );


        console.warn(
            "GLS V3 price preview failed:",
            error
        );


        setMessage(
            newJobMessage,
            getFriendlyJobError(
                error
            ),
            "error"
        );

    }

    finally {

        priceCalculationInProgress =
            false;


        updateCreateJobButton();
    }
}


/* =========================================================
   25. RENDER PRICE PREVIEW
   ========================================================= */

function renderPricePreview(
    pricing
) {

    priceBreakdown
        .replaceChildren();


    if (
        !pricing ||
        !Array.isArray(
            pricing.items
        )
    ) {

        jobTotalAmount.textContent =
            formatCurrency(0);


        priceBreakdown.appendChild(
            createElement(
                "div",
                "price-placeholder",
                selectedService
                    ? "Unable to calculate the current price."
                    : "Select a vehicle and service to calculate price."
            )
        );


        seasonalPricingNotice.hidden =
            true;


        return;
    }


    pricing.items.forEach(
        function (item) {

            const line =
                createElement(
                    "div",
                    "price-line"
                );


            line.appendChild(
                createElement(
                    "span",
                    "",
                    item.name
                )
            );


            line.appendChild(
                createElement(
                    "strong",
                    "",
                    formatCurrency(
                        item.amount
                    )
                )
            );


            priceBreakdown.appendChild(
                line
            );
        }
    );


    const total =
        createElement(
            "div",
            "price-line total"
        );


    total.appendChild(
        createElement(
            "span",
            "",
            "Total"
        )
    );


    total.appendChild(
        createElement(
            "strong",
            "",
            formatCurrency(
                pricing.total_amount
            )
        )
    );


    priceBreakdown.appendChild(
        total
    );


    jobTotalAmount.textContent =
        formatCurrency(
            pricing.total_amount
        );


    if (
        Number(
            pricing.seasonal_total
        ) > 0
    ) {

        seasonalPricingNotice.hidden =
            false;


        seasonalPricingNotice.textContent =
            `Seasonal surcharge applied: ${
                formatCurrency(
                    pricing.seasonal_total
                )
            }`;

    }

    else {

        seasonalPricingNotice.hidden =
            true;
    }
}


/* =========================================================
   26. CUSTOMER / VEHICLE SEARCH
   ========================================================= */

async function searchCustomerVehicle(
    value,
    target = "newJob"
) {

    const searchValue =
        String(
            value || ""
        ).trim();


    if (
        searchInProgress ||
        !searchValue
    ) {

        return;
    }


    searchInProgress =
        true;


    const messageElement =
        target ===
            "global"
            ? globalSearchMessage
            : customerVehicleSearchMessage;


    const resultsElement =
        target ===
            "global"
            ? globalSearchResults
            : customerVehicleResults;


    setMessage(
        messageElement,
        "Searching...",
        "info"
    );


    try {

        const {
            data,
            error
        } =
            await glsSupabase.rpc(
                "search_v3_customer_vehicle",
                {
                    p_search:
                        searchValue,

                    p_limit:
                        20
                }
            );


        if (error) {
            throw error;
        }


        renderCustomerVehicleResults(
            data &&
            Array.isArray(
                data.results
            )
                ? data.results
                : [],
            resultsElement,
            target
        );


        setMessage(
            messageElement,
            ""
        );

    }

    catch (error) {

        console.error(
            "GLS V3 customer/vehicle search failed:",
            error
        );


        setMessage(
            messageElement,
            "Unable to search customer records.",
            "error"
        );

    }

    finally {

        searchInProgress =
            false;
    }
}


/* =========================================================
   27. SEARCH RESULT CARDS
   ========================================================= */

function renderCustomerVehicleResults(
    rows,
    container,
    target
) {

    container.replaceChildren();


    if (
        rows.length === 0
    ) {

        container.appendChild(
            createElement(
                "div",
                "empty-state",
                "No matching customer or vehicle found."
            )
        );


        return;
    }


    rows.forEach(
        function (row) {

            const card =
                createElement(
                    "article",
                    target ===
                        "global"
                        ? "search-result-card"
                        : "lookup-result-card"
                );


            card.appendChild(
                createElement(
                    "strong",
                    "vehicle-plate",
                    row.plate_number ||
                    "No Vehicle"
                )
            );


            const description =
                [
                    row.vehicle_model,
                    row.colour,
                    row.vehicle_category
                ]
                .filter(Boolean)
                .join(" · ");


            card.appendChild(
                createElement(
                    "p",
                    "addon-description",
                    description
                )
            );


            card.appendChild(
                createElement(
                    "p",
                    "addon-description",
                    [
                        row.customer_name ||
                            "Customer",
                        row.phone_number
                    ]
                    .filter(Boolean)
                    .join(" · ")
                )
            );


            if (
                target ===
                "newJob"
            ) {

                const button =
                    createElement(
                        "button",
                        "secondary-button",
                        "Use This Vehicle"
                    );


                button.type =
                    "button";


                button.addEventListener(
                    "click",
                    async function () {

                        selectExistingCustomerVehicle(
                            row
                        );


                        customerVehicleResults
                            .replaceChildren();


                        setMessage(
                            customerVehicleSearchMessage,
                            `${row.plate_number} selected.`,
                            "success"
                        );


                        await refreshPricePreview();
                    }
                );


                card.appendChild(
                    button
                );
            }


            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   28. SELECT EXISTING CUSTOMER / VEHICLE
   ========================================================= */

function selectExistingCustomerVehicle(
    row
) {

    selectedCustomerVehicle =
        row;


    selectedCustomerId.value =
        row.customer_id ||
        "";

    selectedVehicleId.value =
        row.vehicle_id ||
        "";


    customerPhone.value =
        row.phone_number ||
        "";

    customerName.value =
        row.customer_name ||
        "";

    customerNotes.value =
        row.customer_notes ||
        "";


    plateNumber.value =
        row.plate_number ||
        "";

    vehicleModel.value =
        row.vehicle_model ||
        "";

    vehicleColour.value =
        row.colour ||
        "";

    vehicleCategory.value =
        row.vehicle_category ||
        "";

    vehicleNotes.value =
        row.vehicle_notes ||
        "";


    selectedService =
        null;


    renderServiceOptions();

    updateCreateJobButton();
}


/* =========================================================
   29. RESET EXISTING SELECTION WHEN VEHICLE CHANGES
   ========================================================= */

function invalidateExistingVehicleSelection() {

    if (
        !selectedCustomerVehicle
    ) {

        return;
    }


    const samePlate =
        plateNumber.value
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "") ===
        String(
            selectedCustomerVehicle
                .plate_number ||
            ""
        )
            .toUpperCase()
            .replace(/\s+/g, "");


    if (!samePlate) {

        selectedCustomerVehicle =
            null;

        selectedCustomerId.value =
            "";

        selectedVehicleId.value =
            "";


        currentPricePreview =
            null;


        renderPricePreview(
            null
        );
    }
}


/* =========================================================
   30. UPSERT CUSTOMER / VEHICLE
   ========================================================= */

async function upsertCustomerVehicle() {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "upsert_v3_customer_vehicle",
            {
                p_customer_name:
                    customerName.value
                        .trim() ||
                    null,

                p_phone_number:
                    customerPhone.value
                        .trim(),

                p_plate_number:
                    plateNumber.value
                        .trim(),

                p_vehicle_model:
                    vehicleModel.value
                        .trim(),

                p_vehicle_category:
                    vehicleCategory.value,

                p_colour:
                    vehicleColour.value
                        .trim() ||
                    null,

                p_customer_notes:
                    customerNotes.value
                        .trim() ||
                    null,

                p_vehicle_notes:
                    vehicleNotes.value
                        .trim() ||
                    null
            }
        );


    if (error) {
        throw error;
    }


    if (
        !data ||
        !data.customer ||
        !data.vehicle
    ) {

        throw new Error(
            "Customer or vehicle data was not returned."
        );
    }


    selectedCustomerId.value =
        data.customer.id;

    selectedVehicleId.value =
        data.vehicle.id;


    return data;
}


/* =========================================================
   31. CREATE JOB BUTTON STATE
   ========================================================= */

function updateCreateJobButton() {

    const pricingReady =
        Boolean(
            newJobSetup &&
            newJobSetup.pricing &&
            newJobSetup.pricing.ready
        );


    const requiredFieldsReady =
        Boolean(
            customerPhone.value.trim() &&
            plateNumber.value.trim() &&
            vehicleModel.value.trim() &&
            vehicleCategory.value &&
            selectedService
        );


    createJobButton.disabled =
        createJobInProgress ||
        !pricingReady ||
        !requiredFieldsReady;
}


/* =========================================================
   32. FRIENDLY JOB ERRORS
   ========================================================= */

function getFriendlyJobError(
    error
) {

    const message =
        String(
            error &&
            error.message
                ? error.message
                : ""
        );


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "service price has not been configured"
        )
    ) {

        return (
            "The administrator has not configured a price " +
            "for this service and vehicle category."
        );
    }


    if (
        lower.includes(
            "custom amount is required"
        )
    ) {

        return (
            "Enter the amount for the selected custom charge."
        );
    }


    if (
        lower.includes(
            "description is required for other charge"
        )
    ) {

        return (
            "Enter a description for Other Charge."
        );
    }


    if (
        lower.includes(
            "invalid customer phone"
        )
    ) {

        return (
            "Enter a valid customer phone number."
        );
    }


    if (
        lower.includes(
            "phone number is required"
        )
    ) {

        return (
            "Customer phone number is required."
        );
    }


    if (
        lower.includes(
            "vehicle model is required"
        )
    ) {

        return (
            "Vehicle model is required."
        );
    }


    if (
        lower.includes(
            "vehicle plate"
        )
    ) {

        return (
            "Vehicle plate number is required."
        );
    }


    return (
        message ||
        "Unable to process this job."
    );
}


/* =========================================================
   33. CREATE NEW JOB
   ========================================================= */

async function handleNewJobSubmit(
    event
) {

    event.preventDefault();


    if (
        createJobInProgress
    ) {

        return;
    }


    if (
        !customerPhone.value.trim() ||
        !plateNumber.value.trim() ||
        !vehicleModel.value.trim() ||
        !vehicleCategory.value ||
        !selectedService
    ) {

        setMessage(
            newJobMessage,
            "Complete the required customer, vehicle and service details.",
            "error"
        );


        return;
    }


    createJobInProgress =
        true;


    createJobButton.disabled =
        true;

    createJobButton.textContent =
        "Creating Job...";


    setMessage(
        newJobMessage,
        "Creating customer, vehicle and job records...",
        "info"
    );


    try {

        const customerVehicle =
            await upsertCustomerVehicle();


        const addOns =
            buildAddOnPayload();


        const {
            data: job,
            error
        } =
            await glsSupabase.rpc(
                "create_v3_job",
                {
                    p_customer_id:
                        customerVehicle
                            .customer
                            .id,

                    p_vehicle_id:
                        customerVehicle
                            .vehicle
                            .id,

                    p_service_id:
                        selectedService.id,

                    p_add_ons:
                        addOns,

                    p_notes:
                        jobNotes.value
                            .trim() ||
                        null
                }
            );


        if (error) {
            throw error;
        }


        console.log(
            "GLS V3 job created:",
            job
        );


        alert(
            `Job created successfully.\n\n` +
            `${job.job_no}\n` +
            `${job.vehicle.plate_number}\n` +
            `${formatCurrency(
                job.total_amount
            )}`
        );


        resetNewJob();


        navigateToScreen(
            "operationsScreen"
        );


        /*
         * Operations RPC comes in next V3 phase.
         * Until then, show the newest job locally.
         */

        renderTemporaryCreatedJob(
            job
        );

    }

    catch (error) {

        console.error(
            "GLS V3 job creation failed:",
            error
        );


        setMessage(
            newJobMessage,
            getFriendlyJobError(
                error
            ),
            "error"
        );

    }

    finally {

        createJobInProgress =
            false;


        createJobButton.textContent =
            "Create Job";


        updateCreateJobButton();
    }
}


/* =========================================================
   34. TEMPORARY CREATED JOB DISPLAY
   ========================================================= */

function renderTemporaryCreatedJob(
    job
) {

    if (!job) {
        return;
    }


    waitingCount.textContent =
        String(
            Number(
                waitingCount.textContent
            ) + 1
        );


    jobsList.replaceChildren();


    const card =
        createElement(
            "article",
            "job-card"
        );


    const main =
        createElement(
            "div"
        );


    main.appendChild(
        createElement(
            "div",
            "job-number",
            job.job_no
        )
    );


    main.appendChild(
        createElement(
            "div",
            "vehicle-plate",
            job.vehicle &&
            job.vehicle.plate_number
                ? job.vehicle.plate_number
                : "-"
        )
    );


    const meta =
        createElement(
            "div",
            "job-meta"
        );


    [
        job.vehicle &&
            job.vehicle.vehicle_model,

        job.vehicle &&
            job.vehicle.colour,

        job.service &&
            job.service.name,

        formatCurrency(
            job.total_amount
        ),

        "UNPAID"
    ]
    .filter(Boolean)
    .forEach(
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


    const badge =
        createElement(
            "span",
            "status-badge waiting",
            "WAITING"
        );


    card.appendChild(
        main
    );

    card.appendChild(
        badge
    );


    jobsList.appendChild(
        card
    );
}


/* =========================================================
   35. RESET NEW JOB
   ========================================================= */

function resetNewJob() {

    newJobForm.reset();


    customerVehicleSearch.value =
        "";


    selectedCustomerId.value =
        "";

    selectedVehicleId.value =
        "";


    selectedCustomerVehicle =
        null;

    selectedService =
        null;

    currentPricePreview =
        null;


    customerVehicleResults
        .replaceChildren();


    setMessage(
        customerVehicleSearchMessage,
        ""
    );


    setMessage(
        newJobMessage,
        ""
    );


    renderServiceOptions();

    renderAddOnOptions();

    renderPricePreview(
        null
    );


    updateCreateJobButton();
}


/* =========================================================
   36. GLOBAL SEARCH
   ========================================================= */

function handleGlobalSearch(
    event
) {

    event.preventDefault();


    searchCustomerVehicle(
        globalSearchInput.value,
        "global"
    );
}


/* =========================================================
   37. PRICING MANAGEMENT
   ========================================================= */

async function loadPricingData() {

    const {
        data,
        error
    } =
        await glsSupabase.rpc(
            "get_v3_pricing"
        );


    if (error) {
        throw error;
    }


    return data;
}


async function renderAdminPricing() {

    if (
        !currentProfile ||
        currentProfile.role !==
            "admin"
    ) {

        return;
    }


    servicePricingList.replaceChildren();

    addonPricingList.replaceChildren();


    try {

        const pricing =
            await loadPricingData();


        renderServicePricing(
            pricing.services ||
            []
        );


        renderAddonPricing(
            pricing.add_ons ||
            []
        );

    }

    catch (error) {

        console.error(
            "GLS V3 pricing load failed:",
            error
        );


        setMessage(
            pricingMessage,
            "Unable to load pricing.",
            "error"
        );
    }
}


/* =========================================================
   38. SERVICE PRICING ADMIN
   ========================================================= */

function renderServicePricing(
    services
) {

    servicePricingList
        .replaceChildren();


    const categories =
        newJobSetup &&
        Array.isArray(
            newJobSetup.vehicle_categories
        )
            ? newJobSetup
                .vehicle_categories
            : [];


    services.forEach(
        function (service) {

            const card =
                createElement(
                    "article",
                    "pricing-card"
                );


            card.appendChild(
                createElement(
                    "h4",
                    "",
                    service.name
                )
            );


            categories.forEach(
                function (category) {

                    const row =
                        createElement(
                            "div",
                            "pricing-row"
                        );


                    row.appendChild(
                        createElement(
                            "label",
                            "",
                            category
                        )
                    );


                    const existing =
                        Array.isArray(
                            service.prices
                        )
                            ? service.prices.find(
                                function (price) {

                                    return (
                                        price.vehicle_category ===
                                        category
                                    );
                                }
                            )
                            : null;


                    const input =
                        document.createElement(
                            "input"
                        );


                    input.type =
                        "number";

                    input.min =
                        "0";

                    input.step =
                        "0.01";

                    input.inputMode =
                        "decimal";

                    input.value =
                        existing
                            ? existing.amount
                            : "";


                    const save =
                        createElement(
                            "button",
                            "pricing-save-button",
                            "Save"
                        );


                    save.type =
                        "button";


                    save.addEventListener(
                        "click",
                        function () {

                            saveServicePrice(
                                service,
                                category,
                                input,
                                save
                            );
                        }
                    );


                    row.appendChild(
                        input
                    );

                    row.appendChild(
                        save
                    );


                    card.appendChild(
                        row
                    );
                }
            );


            servicePricingList
                .appendChild(
                    card
                );
        }
    );
}


async function saveServicePrice(
    service,
    category,
    input,
    button
) {

    if (
        pricingSaveInProgress
    ) {

        return;
    }


    const amount =
        Number(
            input.value
        );


    if (
        !Number.isFinite(
            amount
        ) ||
        amount < 0
    ) {

        setMessage(
            pricingMessage,
            "Enter a valid price.",
            "error"
        );


        return;
    }


    pricingSaveInProgress =
        true;


    button.disabled =
        true;

    button.textContent =
        "Saving...";


    try {

        const {
            error
        } =
            await glsSupabase.rpc(
                "set_v3_service_price",
                {
                    p_service_id:
                        service.service_id ||
                        service.id,

                    p_vehicle_category:
                        category,

                    p_amount:
                        amount,

                    p_effective_from:
                        newJobSetup.job_date
                }
            );


        if (error) {
            throw error;
        }


        setMessage(
            pricingMessage,
            `${service.name} · ${category} updated.`,
            "success"
        );


        await loadNewJobSetup();

        await renderAdminPricing();

    }

    catch (error) {

        console.error(
            "GLS service price save failed:",
            error
        );


        setMessage(
            pricingMessage,
            "Unable to save service price.",
            "error"
        );

    }

    finally {

        pricingSaveInProgress =
            false;


        if (
            document.body.contains(
                button
            )
        ) {

            button.disabled =
                false;

            button.textContent =
                "Save";
        }
    }
}


/* =========================================================
   39. ADD-ON PRICING ADMIN
   ========================================================= */

function renderAddonPricing(
    addOns
) {

    addonPricingList
        .replaceChildren();


    addOns.forEach(
        function (addOn) {

            const card =
                createElement(
                    "article",
                    "pricing-card"
                );


            card.appendChild(
                createElement(
                    "h4",
                    "",
                    addOn.name
                )
            );


            const row =
                createElement(
                    "div",
                    "pricing-row"
                );


            row.appendChild(
                createElement(
                    "label",
                    "",
                    addOn.allow_custom_amount
                        ? "Default / Custom Base"
                        : "Price"
                )
            );


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "number";

            input.min =
                "0";

            input.step =
                "0.01";

            input.inputMode =
                "decimal";

            input.value =
                addOn.default_amount;


            const save =
                createElement(
                    "button",
                    "pricing-save-button",
                    "Save"
                );


            save.type =
                "button";


            save.addEventListener(
                "click",
                function () {

                    saveAddonPrice(
                        addOn,
                        input,
                        save
                    );
                }
            );


            row.appendChild(
                input
            );

            row.appendChild(
                save
            );


            card.appendChild(
                row
            );


            addonPricingList
                .appendChild(
                    card
                );
        }
    );
}


async function saveAddonPrice(
    addOn,
    input,
    button
) {

    if (
        pricingSaveInProgress
    ) {

        return;
    }


    const amount =
        Number(
            input.value
        );


    if (
        !Number.isFinite(
            amount
        ) ||
        amount < 0
    ) {

        setMessage(
            pricingMessage,
            "Enter a valid add-on price.",
            "error"
        );


        return;
    }


    pricingSaveInProgress =
        true;

    button.disabled =
        true;

    button.textContent =
        "Saving...";


    try {

        const {
            error
        } =
            await glsSupabase.rpc(
                "set_v3_addon_price",
                {
                    p_addon_id:
                        addOn.id,

                    p_amount:
                        amount,

                    p_allow_custom_amount:
                        addOn.allow_custom_amount
                }
            );


        if (error) {
            throw error;
        }


        setMessage(
            pricingMessage,
            `${addOn.name} updated.`,
            "success"
        );


        await loadNewJobSetup();

        await renderAdminPricing();

    }

    catch (error) {

        console.error(
            "GLS add-on price save failed:",
            error
        );


        setMessage(
            pricingMessage,
            "Unable to save add-on price.",
            "error"
        );

    }

    finally {

        pricingSaveInProgress =
            false;


        if (
            document.body.contains(
                button
            )
        ) {

            button.disabled =
                false;

            button.textContent =
                "Save";
        }
    }
}


/* =========================================================
   40. OPEN NEW JOB
   ========================================================= */

async function openNewJob() {

    resetNewJob();


    if (!newJobSetup) {

        await loadNewJobSetup();
    }


    showApplicationScreen(
        newJobScreen
    );


    setActiveNavigation(
        ""
    );


    window.setTimeout(
        function () {

            customerVehicleSearch
                .focus();
        },
        250
    );
}


/* =========================================================
   41. OPEN PRICING
   ========================================================= */

async function openPricingManagement() {

    if (
        !currentProfile ||
        currentProfile.role !==
            "admin"
    ) {

        return;
    }


    showApplicationScreen(
        pricingScreen
    );


    setActiveNavigation(
        ""
    );


    await renderAdminPricing();
}


/* =========================================================
   42. EVENT LISTENERS
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


    navButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    navigateToScreen(
                        button.dataset.screen
                    );
                }
            );
        }
    );


    newJobButton.addEventListener(
        "click",
        openNewJob
    );


    newJobBackButton.addEventListener(
        "click",
        function () {

            navigateToScreen(
                "operationsScreen"
            );
        }
    );


    quickSearchButton.addEventListener(
        "click",
        function () {

            navigateToScreen(
                "searchScreen"
            );


            globalSearchInput.focus();
        }
    );


    customerVehicleSearchForm
        .addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                searchCustomerVehicle(
                    customerVehicleSearch.value,
                    "newJob"
                );
            }
        );


    globalSearchForm.addEventListener(
        "submit",
        handleGlobalSearch
    );


    newJobForm.addEventListener(
        "submit",
        handleNewJobSubmit
    );


    vehicleCategory.addEventListener(
        "change",
        async function () {

            /*
             * Existing selected vehicle must not
             * silently change category without
             * going through the upsert path.
             */

            selectedService =
                null;

            currentPricePreview =
                null;


            renderServiceOptions();

            renderPricePreview(
                null
            );


            updateCreateJobButton();
        }
    );


    plateNumber.addEventListener(
        "input",
        function () {

            plateNumber.value =
                plateNumber.value
                    .toUpperCase()
                    .replace(
                        /[^A-Z0-9 -]/g,
                        ""
                    );


            invalidateExistingVehicleSelection();

            updateCreateJobButton();
        }
    );


    customerPhone.addEventListener(
        "input",
        updateCreateJobButton
    );


    vehicleModel.addEventListener(
        "input",
        updateCreateJobButton
    );


    pricingManagementButton
        .addEventListener(
            "click",
            openPricingManagement
        );


    pricingBackButton.addEventListener(
        "click",
        function () {

            navigateToScreen(
                "adminScreen"
            );
        }
    );


    refreshOperationsButton
        .addEventListener(
            "click",
            function () {

                operationsDate.textContent =
                    formatMalaysiaDateTime();


                loadNewJobSetup();
            }
        );


    jobFilterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    jobFilterButtons.forEach(
                        function (item) {

                            item.classList.toggle(
                                "active",
                                item === button
                            );
                        }
                    );


                    setMessage(
                        operationsMessage,
                        "Live Operations filtering will activate with the V3 Operations RPC.",
                        "info"
                    );
                }
            );
        }
    );
}


/* =========================================================
   43. REQUIRED ELEMENT CHECK
   ========================================================= */

function requiredElementsExist() {

    const required = {

        loginScreen,
        loginForm,
        loginEmail,
        loginPassword,
        loginMessage,
        loginButton,

        headerUser,
        headerUserName,
        headerUserRole,
        logoutButton,

        appScreen,
        mainNavigation,
        adminNavigationButton,

        operationsScreen,
        welcomeHeading,
        operationsDate,
        refreshOperationsButton,
        newJobButton,
        quickSearchButton,

        waitingCount,
        washingCount,
        readyCount,
        closedCount,
        operationsMessage,
        jobsList,

        newJobScreen,
        newJobBackButton,
        pricingWarning,

        customerVehicleSearchForm,
        customerVehicleSearch,
        customerVehicleSearchButton,
        customerVehicleSearchMessage,
        customerVehicleResults,

        newJobForm,
        selectedCustomerId,
        selectedVehicleId,

        customerPhone,
        customerName,
        customerNotes,

        plateNumber,
        vehicleModel,
        vehicleColour,
        vehicleCategory,
        vehicleNotes,

        serviceOptions,
        addOnOptions,
        jobNotes,

        jobTotalAmount,
        priceBreakdown,
        seasonalPricingNotice,
        newJobMessage,
        createJobButton,

        searchScreen,
        globalSearchForm,
        globalSearchInput,
        globalSearchButton,
        globalSearchMessage,
        globalSearchResults,

        adminScreen,
        pricingManagementButton,

        pricingScreen,
        pricingBackButton,
        pricingSetupStatus,
        pricingMessage,
        servicePricingList,
        addonPricingList
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
            "GLS V3 missing HTML elements:",
            missing
        );


        return false;
    }


    return true;
}


/* =========================================================
   44. SUPABASE
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
   45. RESTORE SESSION
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

            const authorised =
                await verifySession(
                    data.session
                );


            if (authorised) {

                await loadNewJobSetup();
            }

        }

        else {

            showLoginScreen();
        }

    }

    catch (error) {

        console.error(
            "GLS V3 session restore failed:",
            error
        );


        showLoginScreen(
            "Unable to restore session. Please sign in again.",
            "error"
        );
    }
}


/* =========================================================
   46. INITIALISE
   ========================================================= */

async function initialiseApplication() {

    if (
        !requiredElementsExist()
    ) {

        return;
    }


    operationsDate.textContent =
        formatMalaysiaDateTime();


    try {

        initialiseSupabase();

    }

    catch (error) {

        console.error(
            "GLS V3 Supabase initialisation failed:",
            error
        );


        setMessage(
            loginMessage,
            "System service is unavailable. Please refresh the page.",
            "error"
        );


        loginButton.disabled =
            true;


        return;
    }


    registerEvents();


    await restoreSession();


    console.log(
        "GLS Car Wash Management System V3 ready."
    );
}


/* =========================================================
   47. START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseApplication
    );

}

else {

    initialiseApplication();
}
