// Utility function for debouncing
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}



// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeVPNModule();
    initializeURLChecker();
    initializePasswordChecker();
    initializeDataBreachChecker();
    initializeNotifications();
    initializeSystemStatus();
    initializeSidebar();
    initializeSearchBar();
});

// Sidebar functionality
function initializeSidebar() {
    const menuItems = document.querySelectorAll('.nav-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Search bar functionality
function initializeSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', debounce((e) => {
        // Sanitize input
        const searchTerm = sanitizeInput(e.target.value);
        // Add search functionality here (replace console.log with actual search logic)
        console.log('Searching for:', searchTerm);
        // You can trigger a search function here, e.g., performSearch(searchTerm);
    }, 300)); // Debounce for 300ms
}

// VPN Module
function initializeVPNModule() {
    const vpnSelect = document.querySelector('.vpn-location');
    const connectBtn = document.querySelector('.connect-btn');
    const statusSpan = document.querySelector('.vpn-status .status');
    let isConnected = false;

    connectBtn.addEventListener('click', () => {
        if (!isConnected) {
            if (!vpnSelect.value) {
                showToast('Please select a location', 'error');
                return;
            }
            connectVPN();
        } else {
            disconnectVPN();
        }
    });

    function connectVPN() {
        statusSpan.textContent = 'Connecting...';
        statusSpan.className = 'status pending';
        connectBtn.disabled = true;
        vpnSelect.disabled = true;

        // Simulate loading with a spinner
        const vpnCard = document.querySelector('.vpn-status .card-content');
        vpnCard.innerHTML = `<div class="loading-spinner"></div>`;

        setTimeout(() => {
            isConnected = true;
            statusSpan.textContent = 'Connected';
            statusSpan.className = 'status active';
            connectBtn.textContent = 'Disconnect';
            connectBtn.disabled = false;
            vpnSelect.disabled = false;

            // Restore the original content with a smooth transition
            vpnCard.innerHTML = `
                <select class="vpn-location" aria-label="Select VPN location">
                    <option value="">Select Location</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="jp">Japan</option>
                </select>
                <button class="connect-btn">Disconnect</button>
            `;
            // Re-initialize the VPN Module
            initializeVPNModule();

            showToast(`Connected to ${vpnSelect.options[vpnSelect.selectedIndex].text}`, 'success');
        }, 2000);
    }

    function disconnectVPN() {
        statusSpan.textContent = 'Disconnecting...';
        statusSpan.className = 'status pending';
        connectBtn.disabled = true;

        const vpnCard = document.querySelector('.vpn-status .card-content');
        vpnCard.innerHTML = `<div class="loading-spinner"></div>`;

        setTimeout(() => {
            isConnected = false;
            statusSpan.textContent = 'Disconnected';
            statusSpan.className = 'status inactive';
            connectBtn.textContent = 'Connect';
            connectBtn.disabled = false;
            vpnSelect.disabled = false;

            // Restore the original content with a smooth transition
            vpnCard.innerHTML = `
                <select class="vpn-location" aria-label="Select VPN location">
                    <option value="">Select Location</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="jp">Japan</option>
                </select>
                <button class="connect-btn">Connect</button>
            `;
            // Re-initialize the VPN Module
            initializeVPNModule();

            showToast('VPN Disconnected', 'info');
        }, 1500);
    }
}

// URL Checker
function initializeURLChecker() {
    const urlInput = document.querySelector('.url-checker input');
    const scanBtn = document.querySelector('.scan-btn');
    const resultsDiv = document.querySelector('.scan-results');

    scanBtn.addEventListener('click', async () => {
        // Sanitize URL input
        const url = sanitizeInput(urlInput.value.trim());
        if (!url) {
            showToast('Please enter a URL', 'error');
            return;
        }

        scanBtn.disabled = true;
        scanBtn.textContent = 'Scanning...';
        resultsDiv.innerHTML = '<div class="scanning">Scanning URL for threats...</div>';

        try {
            const result = await simulateURLScan(url);
            displayURLScanResult(result);
        } catch (error) {
            showToast('Scan failed: ' + error.message, 'error');
        } finally {
            scanBtn.disabled = false;
            scanBtn.textContent = 'Scan';
        }
    });

    function simulateURLScan(url) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate threat detection
                const threats = ['malware', 'phishing', 'suspicious'];
                const isSafe = !threats.some(threat => url.toLowerCase().includes(threat));
                resolve({
                    safe: isSafe,
                    details: isSafe ? 'No threats detected' : 'Potential security risks found',
                    timestamp: new Date().toLocaleString()
                });
            }, 2000);
        });
    }

    function displayURLScanResult(result) {
        const className = result.safe ? 'safe' : 'danger';
        const icon = result.safe ? 'check-circle' : 'exclamation-triangle';

        resultsDiv.innerHTML = `
            <div class="result ${className}">
                <i class="fas fa-${icon}"></i>
                <div class="result-details">
                    <h4>${result.safe ? 'URL is Safe' : 'Warning!'}</h4>
                    <p>${result.details}</p>
                    <small>Scanned at: ${result.timestamp}</small>
                </div>
            </div>
        `;
    }
}

// Password Checker
function initializePasswordChecker() {
    const passwordInput = document.querySelector('.password-checker input');
    const strengthMeter = document.querySelector('.strength-meter');

    passwordInput.addEventListener('input', debounce((e) => {
        // Sanitize password input
        const password = sanitizeInput(e.target.value);
        const strength = calculatePasswordStrength(password);
        updateStrengthMeter(strength);
    }, 200)); // Debounce for 200ms
    

    function calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        return {
            score,
            checks,
            text: ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][score - 1] || 'Very Weak'
        };
    }

    function updateStrengthMeter(strength) {
        const colors = ['#ff4444', '#ffbb33', '#ffeb3b', '#00c851', '#00ff00'];
        strengthMeter.innerHTML = `
            <div class="strength-bars">
                ${Array(5).fill(0).map((_, i) => `
                    <div class="strength-bar ${i < strength.score ? 'filled' : ''}" 
                         style="background-color: ${i < strength.score ? colors[strength.score - 1] : ''}">
                    </div>
                `).join('')}
            </div>
            <div class="strength-text" style="color: ${colors[strength.score - 1]}">
                ${strength.text}
            </div>
        `;
    }
}

// Data Breach Checker
function initializeDataBreachChecker() {
    const emailInput = document.querySelector('.data-breach input');
    const checkBtn = document.querySelector('.check-btn');

    checkBtn.addEventListener('click', async () => {
        // Sanitize email input
        const email = sanitizeInput(emailInput.value.trim());
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        checkBtn.disabled = true;
        checkBtn.textContent = 'Checking...';

        try {
            const result = await simulateBreachCheck(email);
            showBreachResults(result);
        } finally {
            checkBtn.disabled = false;
            checkBtn.textContent = 'Check';        }
        });
    
        function isValidEmail(email) {
            // Basic email format validation
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    
        function simulateBreachCheck(email) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simulate breach status
                    const breached = Math.random() > 0.5;
                    resolve({
                        breached,
                        breachCount: breached ? Math.floor(Math.random() * 3) + 1 : 0,
                        lastBreach: breached ? new Date().toLocaleDateString() : null
                    });
                }, 2000);
            });
        }
    
        function showBreachResults(result) {
            const message = result.breached
                ? `Found in ${result.breachCount} data breach${result.breachCount > 1 ? 'es' : ''}. Last breach: ${result.lastBreach}`
                : 'No data breaches found';
            
            showToast(message, result.breached ? 'warning' : 'success');
        }
    }
    
    // System Status Updates
    function initializeSystemStatus() {
        const statusItems = document.querySelectorAll('.status-item .value');
        
        function updateSystemStatus() {
            statusItems.forEach(item => {
                const random = Math.random();
                if (random > 0.9) {
                    item.className = 'value pending';
                    item.textContent = 'Pending';
                } else if (random > 0.8) {
                    item.className = 'value inactive';
                    item.textContent = 'Inactive';
                } else {
                    item.className = 'value active';
                    item.textContent = 'Active';
                }
            });
        }
    
        // Update status every 30 seconds
        setInterval(updateSystemStatus, 30000);
    }
    
    // Notifications System
    function initializeNotifications() {
        const notificationBell = document.querySelector('.notifications');
        const badge = notificationBell.querySelector('.badge');
        let notificationCount = parseInt(badge.textContent);
    
        notificationBell.addEventListener('click', () => {
            showToast('Notifications cleared', 'info');
            notificationCount = 0;
            badge.textContent = notificationCount;
            badge.style.display = 'none';
        });
    
        // Simulate incoming notifications
        setInterval(() => {
            if (Math.random() > 0.7) {
                notificationCount++;
                badge.textContent = notificationCount;
                badge.style.display = 'block';
                showToast('New security alert received', 'warning');
            }
        }, 60000);
    }
    
    // Toast Notification System
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
    
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    function getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }