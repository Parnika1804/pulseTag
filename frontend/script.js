// ---------- Screen elements ----------
const languageScreen = document.getElementById('language-screen');
const onboardingScreen = document.getElementById('onboarding-screen');
const profileForm = document.getElementById('profile-form');

let currentLang = 'en'; // default language

// ---------- Apply translations to the page ----------
function applyLanguage(langCode) {
    currentLang = langCode;
    const dict = translations[langCode] || translations.en;

    // set document language for accessibility/screen readers
    document.documentElement.lang = langCode;

    // update every element that has a data-i18n key (text content)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // update every element that has a data-i18n-placeholder key
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });
}

// ---------- Step 1: Language selection ----------
const langButtons = document.querySelectorAll('.lang-btn');

langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        const selectedLangCode = btn.getAttribute('data-lang');
        console.log('Selected language:', selectedLangCode);

        applyLanguage(selectedLangCode);
        showOnboarding();
    });
});

function showOnboarding() {
    languageScreen.classList.add('hidden');
    onboardingScreen.classList.remove('hidden');
}

// ---------- Step 2: Fake OTP flow ----------
const sendOtpBtn = document.getElementById('send-otp-btn');
const otpSection = document.getElementById('otp-section');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const otpInput = document.getElementById('otp-input');
const otpSuccessMsg = document.getElementById('otp-success-msg');

sendOtpBtn.addEventListener('click', function () {
    otpSection.classList.remove('hidden');
});

verifyOtpBtn.addEventListener('click', function () {
    const enteredOtp = otpInput.value.trim();

    if (enteredOtp === '1234') {
        otpSuccessMsg.classList.remove('hidden');
        showProfileForm();
    } else {
        alert('Incorrect OTP. Try 1234 for this demo.');
    }
});

function showProfileForm() {
    setTimeout(function () {
        onboardingScreen.classList.add('hidden');
        profileForm.classList.remove('hidden');
    }, 800); // small delay so user sees the success message first
}

// ---------- Step 3: Save profile ----------
const saveProfileBtn = document.getElementById('save-profile-btn');

saveProfileBtn.addEventListener('click', function () {
    const profileData = {
        name: document.getElementById('name-input').value,
        bloodGroup: document.getElementById('blood-group-input').value,
        allergies: document.getElementById('allergies-input').value,
        conditions: document.getElementById('conditions-input').value,
        medications: document.getElementById('medications-input').value,
        language: currentLang
    };

    console.log('Profile data to send to backend:', profileData);

    // NOTE: backend connection (fetch/POST call) happens in Phase 2
});