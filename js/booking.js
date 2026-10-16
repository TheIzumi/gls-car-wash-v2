console.log("GLS Booking System Loaded");

const pricing = {
    "Small Car": {
        normal: 25,
        nano: 40
    },
    "Sedan": {
        normal: 28,
        nano: 43
    },
    "SUV": {
        normal: 35,
        nano: 50
    },
    "MPV": {
        normal: 40,
        nano: 55
    },
    "Van": {
        normal: 50,
        nano: 65
    }
};

const vehicleType = document.getElementById("vehicleType");
const washType = document.getElementById("washType");
const totalAmount = document.getElementById("totalAmount");

function updatePrice() {

    const vehicle = vehicleType.value;
    const wash = washType.value;

    if (!vehicle || !wash) {
        totalAmount.textContent = "RM 0.00";
        return;
    }

    let amount = 0;

    if (wash === "Normal Wash") {
        amount = pricing[vehicle].normal;
    } else {
        amount = pricing[vehicle].nano;
    }

    totalAmount.textContent = `RM ${amount.toFixed(2)}`;
}

vehicleType.addEventListener("change", updatePrice);
washType.addEventListener("change", updatePrice);
