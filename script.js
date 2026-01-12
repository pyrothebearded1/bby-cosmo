// ============================================================================
// Form Elements
// ============================================================================
const form = document.getElementById('emailForm');
const emailInput = document.getElementById('emailAddress');
const storeInput = document.getElementById('storeNumber');
const orderInput = document.getElementById('orderNumber');
const customerInput = document.getElementById('customerName');
const brandInput = document.getElementById('brand');
const modelInput = document.getElementById('model');

const emailError = document.getElementById('emailError');
const storeError = document.getElementById('storeError');
const orderError = document.getElementById('orderError');

const serviceExchangeBtn = document.getElementById('serviceExchangeBtn');
const unitReturnBtn = document.getElementById('unitReturnBtn');

// Modal elements
const modal = document.getElementById('reminderModal');
const closeModalBtn = document.getElementById('closeModal');
const countdownElement = document.getElementById('countdown');

// Variable to store countdown interval
let countdownInterval = null;

// ============================================================================
// Modal Functions
// ============================================================================

function showModal() {
    modal.classList.add('show');
    closeModalBtn.focus();
}

function closeModal() {
    modal.classList.remove('show');
    // Clear countdown interval if it exists
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function startCountdown(callback) {
    let timeLeft = 5;
    countdownElement.textContent = timeLeft;
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            // Execute callback (open Outlook)
            callback();
            // Optionally close modal after opening Outlook
            // closeModal(); // Uncomment if you want modal to auto-close
        }
    }, 1000);
}

// Close modal when clicking the button
closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

// ============================================================================
// Utility Functions
// ============================================================================

function capitalizeName(name) {
    if (!name || name.trim() === '') {
        return name;
    }
    
    // Split by spaces and capitalize each word
    return name.trim().split(' ')
        .map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

// ============================================================================
// Validation Functions
// ============================================================================

function isValidEmail(email) {
    if (!email || email.trim() === '') {
        return false;
    }
    
    // Check for @ symbol
    const atIndex = email.indexOf('@');
    if (atIndex === -1 || atIndex === 0 || atIndex === email.length - 1) {
        return false;
    }
    
    // Check for only one @ symbol
    if (email.indexOf('@', atIndex + 1) !== -1) {
        return false;
    }
    
    // Check for at least one dot after @
    const dotIndex = email.indexOf('.', atIndex);
    if (dotIndex === -1 || dotIndex === atIndex + 1 || dotIndex === email.length - 1) {
        return false;
    }
    
    // Basic character validation
    const validChars = /^[a-zA-Z0-9@._-]+$/;
    return validChars.test(email);
}

function validateStoreNumber(storeNum) {
    if (!storeNum || storeNum.trim() === '') {
        return { valid: false, error: 'Store number is required.' };
    }
    
    // Check if all digits
    if (!/^\d+$/.test(storeNum)) {
        return { valid: false, error: 'Store number must contain only digits.' };
    }
    
    // Check length (3 or 4 digits)
    if (storeNum.length !== 3 && storeNum.length !== 4) {
        return { valid: false, error: 'Store number must be 3 or 4 digits.' };
    }
    
    // Format to 4 digits (add leading 0 if needed)
    const formatted = storeNum.length === 3 ? '0' + storeNum : storeNum;
    
    return { valid: true, formatted: formatted };
}

function validateOrderNumber(orderNum, formattedStoreNum) {
    if (!orderNum || orderNum.trim() === '') {
        // Order number is optional, so return valid if empty
        return { valid: true };
    }
    
    // Expected format: SSSS-YYMMDD-#####
    const orderPattern = /^(\d{4})-(\d{6})-(\d{5})$/;
    const match = orderNum.match(orderPattern);
    
    if (!match) {
        return { 
            valid: false, 
            error: 'Order number must be in format SSSS-YYMMDD-##### (e.g., 0630-250814-56874)' 
        };
    }
    
    const orderStoreNum = match[1];
    
    // Check if first 4 digits match formatted store number
    if (orderStoreNum !== formattedStoreNum) {
        return { 
            valid: false, 
            error: `Order number store code (${orderStoreNum}) must match store number (${formattedStoreNum})` 
        };
    }
    
    return { valid: true };
}

// ============================================================================
// Email Generation Functions
// ============================================================================

function generateCCEmails(formattedStoreNum) {
    // Format: 00 + 4-digit store number = 6 digits total
    const storeCode = '00' + formattedStoreNum;
    const cc1 = `BBY-DL-STORE-${storeCode}-SHIFTLEADERS@bestbuy.com`;
    const cc2 = `BBY-DL-STORE-${storeCode}-PRECINCT@bestbuy.com`;
    return `${cc1};${cc2}`;
}

function getServiceExchangeTemplate(storeNum, orderNum, customerName, brand, model) {
    let body = `Hello ${customerName},\n\n`;
    body += `This email is to inform you that you are authorized to receive an exchange on your unit that you brought in for service. `;
    body += `You will need to take a copy of your receipt when you go to your local Best Buy store for the exchange.\n\n`;
    body += `Service Order: ${orderNum}\n`;
    body += `Brand: ${brand}\n`;
    body += `Model: ${model}\n\n`;
    body += `If you have any questions please contact your local Best Buy store or track your repair on our website.\n`;
    body += `Thank you for allowing Geek Squad to serve you!`;
    return body;
}

function getUnitReturnTemplate(storeNum, orderNum, customerName, brand, model) {
    let body = `Hello ${customerName},\n\n`;
    body += `This e-mail is to inform you that your unit has been shipped to your Best Buy store. `;
    body += `They will be contacting you to set up an appointment to come in and pick up your unit.\n\n`;
    body += `Service Order: ${orderNum}\n`;
    body += `Brand: ${brand}\n`;
    body += `Model: ${model}\n\n`;
    body += `If you have any questions please contact your local Best Buy store or track your repair on our website.\n`;
    body += `Thank you for allowing Geek Squad to serve you!`;
    return body;
}

// ============================================================================
// URL Encoding
// ============================================================================

function urlEncode(str) {
    return encodeURIComponent(str);
}

// ============================================================================
// Open Mailto
// ============================================================================

function openMailto(to, cc, subject, body) {
    let mailto = `mailto:${to}`;
    
    const params = [];
    if (cc) params.push(`cc=${urlEncode(cc)}`);
    if (subject) params.push(`subject=${urlEncode(subject)}`);
    if (body) params.push(`body=${urlEncode(body)}`);
    
    if (params.length > 0) {
        mailto += '?' + params.join('&');
    }
    
    window.location.href = mailto;
}

// ============================================================================
// Form Validation and Submission
// ============================================================================

function clearErrors() {
    emailError.textContent = '';
    storeError.textContent = '';
    orderError.textContent = '';
    emailInput.classList.remove('error', 'shake');
    storeInput.classList.remove('error', 'shake');
    orderInput.classList.remove('error', 'shake');
}

function showError(input, errorElement, message) {
    input.classList.add('error', 'shake');
    errorElement.textContent = message;
    input.focus();
    
    // Remove shake animation after it completes
    setTimeout(() => {
        input.classList.remove('shake');
    }, 500);
}

function handleEmailGeneration(templateType) {
    clearErrors();
    
    // Get form values
    const email = emailInput.value.trim();
    const storeNum = storeInput.value.trim();
    const orderNum = orderInput.value.trim();
    const customerName = capitalizeName(customerInput.value.trim());
    const brand = brandInput.value.trim();
    const model = modelInput.value.trim();
    
    // Validate email
    if (!email) {
        showError(emailInput, emailError, 'Please enter an email address.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(emailInput, emailError, 'Please enter a valid email address (e.g., customer@example.com).');
        return;
    }
    
    // Validate store number
    const storeValidation = validateStoreNumber(storeNum);
    if (!storeValidation.valid) {
        showError(storeInput, storeError, storeValidation.error);
        return;
    }
    
    const formattedStoreNum = storeValidation.formatted;
    
    // Validate order number (only if provided)
    const orderValidation = validateOrderNumber(orderNum, formattedStoreNum);
    if (!orderValidation.valid) {
        showError(orderInput, orderError, orderValidation.error);
        return;
    }
    
    // Generate CC emails
    const ccEmails = generateCCEmails(formattedStoreNum);
    
    // Generate subject and body based on template type
    let subject, body;
    
    if (templateType === 'service-exchange') {
        subject = `Geek Squad Service Exchange Authorization - Order #${orderNum}`;
        body = getServiceExchangeTemplate(formattedStoreNum, orderNum, customerName, brand, model);
    } else {
        subject = `Geek Squad Unit Return - Order #${orderNum}`;
        body = getUnitReturnTemplate(formattedStoreNum, orderNum, customerName, brand, model);
    }
    
    // Show modal FIRST with countdown
    showModal();
    
    // Start countdown, then open mailto link when done
    startCountdown(() => {
        openMailto(email, ccEmails, subject, body);
    });
}

// ============================================================================
// Event Listeners
// ============================================================================

serviceExchangeBtn.addEventListener('click', () => {
    handleEmailGeneration('service-exchange');
});

unitReturnBtn.addEventListener('click', () => {
    handleEmailGeneration('unit-return');
});

// Real-time validation feedback
emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !isValidEmail(email)) {
        emailError.textContent = 'Invalid email format';
        emailInput.classList.add('error');
    } else {
        emailError.textContent = '';
        emailInput.classList.remove('error');
    }
});

storeInput.addEventListener('blur', () => {
    const storeNum = storeInput.value.trim();
    if (storeNum) {
        const validation = validateStoreNumber(storeNum);
        if (!validation.valid) {
            storeError.textContent = validation.error;
            storeInput.classList.add('error');
        } else {
            storeError.textContent = '';
            storeInput.classList.remove('error');
        }
    }
});

orderInput.addEventListener('blur', () => {
    const orderNum = orderInput.value.trim();
    const storeNum = storeInput.value.trim();
    
    if (orderNum && storeNum) {
        const storeValidation = validateStoreNumber(storeNum);
        if (storeValidation.valid) {
            const orderValidation = validateOrderNumber(orderNum, storeValidation.formatted);
            if (!orderValidation.valid) {
                orderError.textContent = orderValidation.error;
                orderInput.classList.add('error');
            } else {
                orderError.textContent = '';
                orderInput.classList.remove('error');
            }
        }
    }
});

// Clear errors on input
emailInput.addEventListener('input', () => {
    emailError.textContent = '';
    emailInput.classList.remove('error');
});

storeInput.addEventListener('input', () => {
    storeError.textContent = '';
    storeInput.classList.remove('error');
    // Also revalidate order number if it exists
    if (orderInput.value.trim()) {
        orderError.textContent = '';
        orderInput.classList.remove('error');
    }
});

orderInput.addEventListener('input', () => {
    orderError.textContent = '';
    orderInput.classList.remove('error');
});

// Auto-capitalize customer name on blur
customerInput.addEventListener('blur', () => {
    const name = customerInput.value.trim();
    if (name) {
        customerInput.value = capitalizeName(name);
    }
});

// Prevent form submission on Enter key
form.addEventListener('submit', (e) => {
    e.preventDefault();
});

// Allow Enter key to trigger Service Exchange button
form.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleEmailGeneration('service-exchange');
    }
});

// Format store number input to only allow digits
storeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});
