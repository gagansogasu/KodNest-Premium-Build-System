// KodNest Premium Build System - Core Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('KodNest Premium Build System Initialized');

    // Simple Router
    const routes = {
        '#dashboard': 'Dashboard',
        '#saved': 'Saved Notifications',
        '#digest': 'Weekly Digest',
        '#settings': 'System Settings',
        '#proof': 'Submission Proof'
    };

    function handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const pageTitle = routes[hash] || 'Dashboard';

        // Update Page Content
        const titleElement = document.getElementById('page-title');
        const subtextElement = document.querySelector('.context-header .subtext');

        if (titleElement) titleElement.textContent = pageTitle;
        if (subtextElement) subtextElement.textContent = "This section will be built in the next step.";

        // Update Active Nav State
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });

        // Close mobile menu on navigate
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) navMenu.classList.remove('open');
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Initial load

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    // Example Copy Prompt Logic (Keep from previous version)
    const copyBtn = document.querySelector('.secondary-panel .btn-secondary');
    if (copyBtn && copyBtn.textContent.includes('Copy')) {
        copyBtn.addEventListener('click', () => {
            const promptBox = document.querySelector('.prompt-box p');
            if (!promptBox) return;
            const promptText = promptBox.textContent;
            navigator.clipboard.writeText(promptText).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        });
    }

    // Toggle Checklist States
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const label = e.target.parentElement;
            if (e.target.checked) {
                label.style.color = 'var(--accent-color)';
                label.style.fontWeight = '600';
            } else {
                label.style.color = 'var(--text-secondary)';
                label.style.fontWeight = '400';
            }
        });
    });
});
