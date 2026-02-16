// KodNest Premium Build System - Core Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('KodNest Premium Build System Initialized');

    // Simple Router
    const routes = {
        '': 'Home',
        '#dashboard': 'Dashboard',
        '#saved': 'Saved Notifications',
        '#digest': 'Weekly Digest',
        '#settings': 'System Settings',
        '#proof': 'Submission Proof'
    };

    function handleRoute() {
        const hash = window.location.hash || '';
        const pageKey = hash === '' ? 'home' : hash.replace('#', '');

        const mainContent = document.getElementById('main-content');
        const contextHeader = document.querySelector('.context-header');

        if (!mainContent || !contextHeader) return;

        // Default Reset
        contextHeader.style.display = 'block';
        mainContent.innerHTML = '';

        if (hash === '' || hash === '#home') {
            contextHeader.style.display = 'none';
            mainContent.innerHTML = `
                <section class="hero-section">
                    <h1>Stop Missing The Right Jobs.</h1>
                    <p class="subtext">Precision-matched job discovery delivered daily at 9AM.</p>
                    <a href="#settings" class="btn btn-primary" style="margin-top: var(--space-3);">Start Tracking</a>
                </section>
            `;
        } else if (hash === '#dashboard') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Experience Personalized Discovery</h1>
                <p class="subtext">Your daily match quality is calculated based on your preference profile.</p>
            `;
            mainContent.innerHTML = `
                <div class="workspace-wrapper">
                    <section class="primary-workspace full-width">
                        <div class="empty-state">
                            <div class="empty-state-icon">◈</div>
                            <h3>No jobs yet.</h3>
                            <p class="muted">In the next step, you will load a realistic dataset.</p>
                        </div>
                    </section>
                </div>
            `;
        } else if (hash === '#settings') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Preference Profile</h1>
                <p class="subtext">Define your search parameters. Our system prioritizes intent over volume.</p>
            `;
            mainContent.innerHTML = `
                <div class="workspace-wrapper">
                    <section class="primary-workspace" style="flex: 0 0 100%;">
                        <div class="card">
                            <h3>Search Parameters</h3>
                            <div class="form-grid">
                                <div class="input-group">
                                    <label class="label">Role Keywords</label>
                                    <input type="text" placeholder="e.g. Senior Frontend Engineer, Product Designer">
                                </div>
                                <div class="input-group">
                                    <label class="label">Preferred Locations</label>
                                    <input type="text" placeholder="e.g. Bangalore, Remote, London">
                                </div>
                                <div class="input-group">
                                    <label class="label">Working Mode</label>
                                    <select class="btn btn-secondary full-width" style="justify-content: flex-start; text-indent: 10px;">
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                        <option>Onsite</option>
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label class="label">Experience Level</label>
                                    <input type="text" placeholder="e.g. 5+ years, Mid-Level">
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-primary">Save Preferences</button>
                    </section>
                </div>
            `;
        } else if (hash === '#saved' || hash === '#digest') {
            const title = hash === '#saved' ? 'Saved Collections' : 'Weekly Digest';
            contextHeader.innerHTML = `
                <h1 id="page-title">${title}</h1>
                <p class="subtext">Your curated inventory of high-signal opportunities.</p>
            `;
            mainContent.innerHTML = `
                <div class="workspace-wrapper">
                    <section class="primary-workspace full-width">
                        <div class="empty-state">
                            <div class="empty-state-icon">✧</div>
                            <h3>Nothing here yet.</h3>
                            <p class="muted">Star jobs from your dashboard to see them appear here.</p>
                        </div>
                    </section>
                </div>
            `;
        } else if (hash === '#proof') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Submission Proof</h1>
                <p class="subtext">Collect and verify your application artifacts for systematic tracking.</p>
            `;
            mainContent.innerHTML = `
                <div class="workspace-wrapper">
                    <section class="primary-workspace full-width">
                        <div class="card">
                            <h3>Artifact Collection</h3>
                            <p class="muted">Placeholder for artifact collection and verification interface.</p>
                            <button class="btn btn-secondary" style="border-style: dashed;">Upload Proof</button>
                        </div>
                    </section>
                </div>
            `;
        }

        // Update Active Nav State
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === hash || (hash === '' && href === '#dashboard'));
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
