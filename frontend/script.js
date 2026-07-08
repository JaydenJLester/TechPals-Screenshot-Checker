const screenshotUpload = document.getElementById("screenshotUpload");
const previewArea = document.getElementById("previewArea");
const imagePreview = document.getElementById("imagePreview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const deleteImageBtn = document.getElementById("deleteImageBtn");

const questionInputs = document.querySelectorAll("input[name='questionType']");
const followUpArea = document.getElementById("followUpArea");
const followUpQuestion = document.getElementById("followUpQuestion");

const errorMessage = document.getElementById("errorMessage");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");

const resultCard = document.getElementById("resultCard");
const selectedQuestionText = document.getElementById("selectedQuestionText");
const followUpText = document.getElementById("followUpText");

const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

let selectedFile = null;

screenshotUpload.addEventListener("change", function () {
    hideError();
    resultCard.classList.add("hidden");

    const file = screenshotUpload.files[0];

    if (!file) {
        return;
    }

    if (!allowedTypes.includes(file.type)) {
        showError("Please upload a PNG, JPG, JPEG, or WEBP image.");
        resetImage();
        return;
    }

    if (file.size > maxFileSize) {
        showError("This image is too large. Please upload an image under 5 MB.");
        resetImage();
        return;
    }

    selectedFile = file;

    fileName.textContent = file.name;
    fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    const previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;

    previewArea.classList.remove("hidden");
});

deleteImageBtn.addEventListener("click", function () {
    resetImage();
    resultCard.classList.add("hidden");
});

questionInputs.forEach(function (input) {
    input.addEventListener("change", function () {
        followUpArea.classList.remove("hidden");
        resultCard.classList.add("hidden");
    });
});

checkBtn.addEventListener("click", function () {
    hideError();
    resultCard.classList.add("hidden");

    const selectedQuestion = document.querySelector("input[name='questionType']:checked");

    if (!selectedFile) {
        showError("Please upload a screenshot first.");
        return;
    }

    if (!selectedQuestion) {
        showError("Please choose what you want help with.");
        return;
    }

    selectedQuestionText.textContent = `You selected: ${getQuestionLabel(selectedQuestion.value)}`;

    if (followUpQuestion.value.trim()) {
        followUpText.textContent = `Your note: ${followUpQuestion.value.trim()}`;
        followUpText.classList.remove("hidden");
    } else {
        followUpText.textContent = "";
        followUpText.classList.add("hidden");
    }

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

resetBtn.addEventListener("click", function () {
    resetImage();

    questionInputs.forEach(function (input) {
        input.checked = false;
    });

    followUpQuestion.value = "";
    followUpArea.classList.add("hidden");

    hideError();
    resultCard.classList.add("hidden");
});

function resetImage() {
    selectedFile = null;
    screenshotUpload.value = "";
    imagePreview.src = "";
    fileName.textContent = "";
    fileSize.textContent = "";
    previewArea.classList.add("hidden");
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

function getQuestionLabel(value) {
    if (value === "meaning") return "What does this mean?";
    if (value === "safety") return "Is this safe?";
    if (value === "action") return "Should I do anything with this?";
    if (value === "other") return "Other";
    return "Unknown";
}