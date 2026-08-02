// ---------- Elements ----------
const loadingMessage = document.getElementById('loading-message');
const emergencyCard = document.getElementById('emergency-card');
const errorMessage = document.getElementById('error-message');

const BACKEND_URL = 'http://localhost:8000'; // same backend as script.js

// ---------- Apply saved language (site-wide, same as index.html) ----------
function applyLanguage(langCode) {
    const dict = translations[langCode] || translations.en;
    document.documentElement.lang = langCode;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
}

window.addEventListener('DOMContentLoaded', function () {
    const savedLang = localStorage.getItem('pulsetag_lang') || 'en';
    applyLanguage(savedLang);

    // ---------- Read the user id from the URL ----------
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    if (!userId) {
        showError();
        return;
    }

    // ---------- Fetch emergency data from backend ----------
    fetch(BACKEND_URL + '/emergency/' + userId)
        .then(function (res) {
            if (!res.ok) throw new Error('Not found');
            return res.json();
        })
        .then(function (data) {
            fillCard(data);
        })
        .catch(function (err) {
            console.error('Failed to load emergency data:', err);
            showError();
        });
});

function fillCard(data) {
    document.getElementById('ec-name').textContent = data.name || '-';
    document.getElementById('ec-blood-group').textContent = data.blood_group || '-';
    document.getElementById('ec-allergies').textContent = data.allergies || '-';
    document.getElementById('ec-conditions').textContent = data.conditions || '-';
    document.getElementById('ec-medications').textContent = data.medications || '-';
    document.getElementById('ec-contact').textContent = data.emergency_contact || '-';

    loadingMessage.classList.add('hidden');
    emergencyCard.classList.remove('hidden');
}

function showError() {
    loadingMessage.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}