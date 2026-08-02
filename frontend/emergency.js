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

    const alertSentMessage = document.getElementById('alert-sent-message');
    if (alertSentMessage) {
        alertSentMessage.classList.remove('hidden');
    }

    const consentLogSection = document.getElementById('consent-log-section');
    if (consentLogSection) {
        consentLogSection.classList.remove('hidden');
    }

    const fullHistorySection = document.getElementById('full-history-section');
    if (fullHistorySection) {
        fullHistorySection.classList.remove('hidden');
    }
}

// ---------- Request Full Medical History (with consent confirmation) ----------
const requestFullHistoryBtn = document.getElementById('request-full-history-btn');
const consentModalOverlay = document.getElementById('consent-modal-overlay');
const consentCancelBtn = document.getElementById('consent-cancel-btn');
const consentConfirmBtn = document.getElementById('consent-confirm-btn');
const fullHistoryResult = document.getElementById('full-history-result');

if (requestFullHistoryBtn) {
    requestFullHistoryBtn.addEventListener('click', function () {
        consentModalOverlay.classList.remove('hidden');
    });
}

if (consentCancelBtn) {
    consentCancelBtn.addEventListener('click', function () {
        consentModalOverlay.classList.add('hidden');
    });
}

if (consentConfirmBtn) {
    consentConfirmBtn.addEventListener('click', function () {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('id');

        consentConfirmBtn.disabled = true;
        consentConfirmBtn.textContent = 'Requesting...';

        fetch(BACKEND_URL + '/request-full-history/' + userId, { method: 'POST' })
            .then(function (res) {
                if (!res.ok) throw new Error('Request failed');
                return res.json();
            })
            .then(function (data) {
                fullHistoryResult.innerHTML = '';
                fullHistoryResult.textContent = data.message || 'Request sent. Awaiting patient consent.';
                fullHistoryResult.classList.remove('hidden');
            })
            .catch(function (err) {
                console.error('Failed to request full history:', err);
                fullHistoryResult.innerHTML = '';
                fullHistoryResult.textContent = 'Could not send request. Try again later.';
                fullHistoryResult.classList.remove('hidden');
            })
            .finally(function () {
                consentModalOverlay.classList.add('hidden');
                consentConfirmBtn.disabled = false;
                consentConfirmBtn.textContent = translations[localStorage.getItem('pulsetag_lang') || 'en'].consentConfirmBtn;
            });
    });
}

// ---------- Consent log: who accessed this record and when ----------
const viewConsentLogBtn = document.getElementById('view-consent-log-btn');

if (viewConsentLogBtn) {
    viewConsentLogBtn.addEventListener('click', function () {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('id');
        const logList = document.getElementById('consent-log-list');
        const logEntries = document.getElementById('consent-log-entries');

        fetch(BACKEND_URL + '/consent-log/' + userId)
            .then(function (res) {
                if (!res.ok) throw new Error('Could not load consent log');
                return res.json();
            })
            .then(function (entries) {
                logEntries.innerHTML = '';

                if (!entries || entries.length === 0) {
                    logEntries.textContent = 'No access recorded yet.';
                } else {
                    entries.forEach(function (entry) {
                        const row = document.createElement('div');
                        row.className = 'consent-log-row';
                        row.textContent = entry.accessed_by + ' — ' + entry.timestamp;
                        logEntries.appendChild(row);
                    });
                }

                logList.classList.remove('hidden');
            })
            .catch(function (err) {
                console.error('Failed to load consent log:', err);
                logEntries.innerHTML = '';
                logEntries.textContent = 'Could not load access history.';
                logList.classList.remove('hidden');
            });
    });
}

function showError() {
    loadingMessage.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}