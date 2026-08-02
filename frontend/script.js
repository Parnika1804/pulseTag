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

const BACKEND_URL = 'http://localhost:8000'; // change this if Person2's backend runs elsewhere

function generateQrCode(userId) {
    const qrSection = document.getElementById('qr-section');
    const qrCanvas = document.getElementById('qr-canvas');

    // Change this base URL to wherever emergency.html is actually hosted
    const emergencyUrl = window.location.origin + '/emergency.html?id=' + userId;

    QRCode.toCanvas(qrCanvas, emergencyUrl, function (err) {
        if (err) {
            console.error('Failed to generate QR code:', err);
            return;
        }
        qrSection.classList.remove('hidden');
        console.log('QR code generated for:', emergencyUrl);
    });
}
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function () {
        const documentsInput = document.getElementById('documents-input');
        const selectedFiles = documentsInput.files;
        const fileNames = Array.from(selectedFiles).map(function (f) { return f.name; });

        console.log('Selected documents:', fileNames);
        // NOTE: actually uploading these files to the health locker is a later
        // step — for this demo we're just capturing the file names for now.

        const profileData = {
            name: document.getElementById('name-input').value,
            blood_group: document.getElementById('blood-group-input').value,
            allergies: document.getElementById('allergies-input').value,
            conditions: document.getElementById('conditions-input').value,
            medications: document.getElementById('medications-input').value,
            language: currentLang
        };

        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = 'Saving...';

        fetch(BACKEND_URL + '/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Server responded with an error');
                return res.json();
            })
            .then(function (data) {
                console.log('Profile saved. Backend response:', data);
                generateQrCode(data.id);
            })
            .catch(function (err) {
                console.error('Failed to save profile:', err);
                alert('Could not save profile. Is the backend running?');
            })
            .finally(function () {
                saveProfileBtn.disabled = false;
                saveProfileBtn.textContent = translations[currentLang].saveBtn;
            });
    });
}