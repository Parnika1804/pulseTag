// ---------- Screen elements ----------
const languageScreen = document.getElementById('language-screen');
const onboardingScreen = document.getElementById('onboarding-screen');
const profileForm = document.getElementById('profile-form');

// ---------- Language state (persisted across the whole site) ----------
// 'pulsetag_lang' is saved in localStorage so every page on the site
// can read it and load directly in the user's chosen language.
let currentLang = localStorage.getItem('pulsetag_lang') || 'en';

// ---------- Apply translations to the page ----------
function applyLanguage(langCode) {
    currentLang = langCode;
    localStorage.setItem('pulsetag_lang', langCode); // remember it site-wide

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

// ---------- Run on every page load ----------
// If the user already picked a language on a previous page/visit,
// apply it immediately and skip straight past the language screen.
window.addEventListener('DOMContentLoaded', function () {
    const savedLang = localStorage.getItem('pulsetag_lang');

    if (savedLang) {
        applyLanguage(savedLang);

        // if this page has a language-selection screen, skip it
        // since the user already chose their language before
        if (languageScreen) {
            languageScreen.classList.add('hidden');
            if (onboardingScreen) {
                onboardingScreen.classList.remove('hidden');
            }
        }
    }
});

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
    if (languageScreen) languageScreen.classList.add('hidden');
    if (onboardingScreen) onboardingScreen.classList.remove('hidden');
}

// ---------- Step 2: Fake OTP flow ----------
const sendOtpBtn = document.getElementById('send-otp-btn');
const otpSection = document.getElementById('otp-section');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const otpInput = document.getElementById('otp-input');
const otpSuccessMsg = document.getElementById('otp-success-msg');

if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', function () {
        otpSection.classList.remove('hidden');
    });
}

if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', function () {
        const enteredOtp = otpInput.value.trim();

        if (enteredOtp === '1234') {
            otpSuccessMsg.classList.remove('hidden');
            showProfileForm();
        } else {
            alert('Incorrect OTP. Try 1234 for this demo.');
        }
    });
}

function showProfileForm() {
    setTimeout(function () {
        if (onboardingScreen) onboardingScreen.classList.add('hidden');
        if (profileForm) profileForm.classList.remove('hidden');
    }, 800); // small delay so user sees the success message first
}

// ---------- Step 3: Save profile ----------
const saveProfileBtn = document.getElementById('save-profile-btn');

if (saveProfileBtn) {
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
}