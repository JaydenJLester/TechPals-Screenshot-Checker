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
const resultContent = document.getElementById("resultContent");

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

checkBtn.addEventListener("click", async function () {
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

    try {
        setLoading(true);

        const base64Image = await fileToBase64(selectedFile);

        const response = await fetch("http://localhost:3001/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                imageBase64: base64Image,
                mimeType: selectedFile.type,
                questionType: selectedQuestion.value,
                followUpQuestion: followUpQuestion.value.trim(),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        showResult(data.result);
    } catch (error) {
        console.error(error);
        showError("Something went wrong while checking the screenshot. Please try again.");
    } finally {
        setLoading(false);
    }
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
    resultContent.innerHTML = "";
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

function setLoading(isLoading) {
    if (isLoading) {
        checkBtn.disabled = true;
        checkBtn.textContent = "Checking Screenshot...";
    } else {
        checkBtn.disabled = false;
        checkBtn.textContent = "Check Screenshot";
    }
}

function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            const result = reader.result;
            const base64 = result.split(",")[1];
            resolve(base64);
        };

        reader.onerror = function () {
            reject(new Error("Could not read image file."));
        };

        reader.readAsDataURL(file);
    });
}

function showResult(resultText) {
    resultContent.innerHTML = formatResponse(resultText);
    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatResponse(text) {
    return text
        .replace(/MAIN ANSWER:/g, "<h2>MAIN ANSWER:</h2>")
        .replace(/WHAT I NOTICE:/g, "<h3>WHAT I NOTICE:</h3>")
        .replace(/POTENTIAL DANGERS:/g, "<h3>POTENTIAL DANGERS:</h3>")
        .replace(/RECOMMENDED ACTION:/g, "<h3>RECOMMENDED ACTION:</h3>")
        .replace(/INFORMATION NEEDED FOR A STRONGER ANSWER:/g, "<h3>INFORMATION NEEDED FOR A STRONGER ANSWER:</h3>")
        .replace(/\n- /g, "<br>• ")
        .replace(/\n/g, "<br>");
}