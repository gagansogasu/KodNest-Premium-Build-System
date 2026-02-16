// KodNest Premium Build System - Core Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('KodNest Premium Build System Initialized');

    // Simple Router
    let allJobs = [];
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');

    async function fetchJobs() {
        try {
            const response = await fetch('jobs.json');
            allJobs = await response.json();
            if (window.location.hash === '#dashboard' || window.location.hash === '') {
                renderDashboard();
            } else if (window.location.hash === '#saved') {
                renderSaved();
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }

    function createJobCard(job, isSavedPage = false) {
        const isSaved = savedJobs.includes(job.id);
        return `
            <div class="job-card" data-id="${job.id}">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="job-company">${job.company}</div>
                    </div>
                    <div class="badge badge-source">${job.source}</div>
                </div>
                <div class="job-meta">
                    <span class="badge">${job.location}</span>
                    <span class="badge">${job.mode}</span>
                    <span class="badge">${job.experience}</span>
                    <span class="badge" style="color: var(--success-color)">${job.salaryRange}</span>
                </div>
                <div class="job-footer">
                    <span class="job-posted">${job.postedDaysAgo === 0 ? 'Recently posted' : job.postedDaysAgo + ' days ago'}</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm icon-btn view-job" style="padding: 8px 12px;">View</button>
                        <button class="btn btn-secondary btn-sm icon-btn save-job" style="padding: 8px 12px; ${isSaved ? 'color: var(--accent-color); border-color: var(--accent-color);' : ''}">
                            ${isSaved ? 'Saved' : 'Save'}
                        </button>
                        <a href="${job.applyUrl}" target="_blank" class="btn btn-primary btn-sm" style="padding: 8px 12px;">Apply</a>
                    </div>
                </div>
            </div>
        `;
    }

    function renderFilterBar() {
        return `
            <div class="filter-bar">
                <div class="filter-group">
                    <input type="text" id="search-input" class="filter-input" placeholder="Search title or company...">
                </div>
                <div class="filter-group">
                    <select id="location-filter" class="filter-input">
                        <option value="">All Locations</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Remote">Remote</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select id="mode-filter" class="filter-input">
                        <option value="">Any Mode</option>
                        <option value="Onsite">Onsite</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select id="exp-filter" class="filter-input">
                        <option value="">Any Experience</option>
                        <option value="Fresher">Fresher</option>
                        <option value="0-1">0-1 Year</option>
                        <option value="1-3">1-3 Years</option>
                        <option value="3-5">3-5 Years</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select id="sort-filter" class="filter-input">
                        <option value="latest">Latest First</option>
                        <option value="salary">High Salary</option>
                    </select>
                </div>
            </div>
        `;
    }

    function renderDashboard() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div style="padding: 0 var(--space-3) var(--space-5);">
                ${renderFilterBar()}
                <div id="job-list" class="job-grid">
                    <!-- Jobs will be rendered here -->
                </div>
            </div>
        `;

        updateJobList();

        // Attach event listeners for filters
        ['search-input', 'location-filter', 'mode-filter', 'exp-filter', 'sort-filter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateJobList);
        });
    }

    function updateJobList() {
        const query = document.getElementById('search-input')?.value.toLowerCase() || '';
        const loc = document.getElementById('location-filter')?.value || '';
        const mode = document.getElementById('mode-filter')?.value || '';
        const exp = document.getElementById('exp-filter')?.value || '';
        const sort = document.getElementById('sort-filter')?.value || 'latest';

        let filtered = allJobs.filter(job => {
            const matchesQuery = job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query);
            const matchesLoc = loc === '' || job.location === loc;
            const matchesMode = mode === '' || job.mode === mode;
            const matchesExp = exp === '' || job.experience === exp;
            return matchesQuery && matchesLoc && matchesMode && matchesExp;
        });

        if (sort === 'latest') {
            filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
        }

        const jobList = document.getElementById('job-list');
        if (jobList) {
            jobList.innerHTML = filtered.map(job => createJobCard(job)).join('');
            attachJobActions();
        }
    }

    function renderSaved() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const filtered = allJobs.filter(job => savedJobs.includes(job.id));

        if (filtered.length === 0) {
            mainContent.innerHTML = `
                <section class="primary-workspace full-width">
                    <div class="empty-state">
                        <div class="empty-state-icon">✧</div>
                        <h3>Nothing saved yet.</h3>
                        <p class="muted">Star jobs from your dashboard to see them appear here.</p>
                        <a href="#dashboard" class="btn btn-secondary" style="margin-top: var(--space-2);">Browse Jobs</a>
                    </div>
                </section>
            `;
        } else {
            mainContent.innerHTML = `
                <div style="padding: var(--space-3) var(--space-3) var(--space-5);">
                    <div class="job-grid">
                        ${filtered.map(job => createJobCard(job, true)).join('')}
                    </div>
                </div>
            `;
            attachJobActions();
        }
    }

    function attachJobActions() {
        document.querySelectorAll('.view-job').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.job-card').dataset.id);
                showJobModal(id);
            });
        });

        document.querySelectorAll('.save-job').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.job-card').dataset.id);
                toggleSaveJob(id, btn);
            });
        });
    }

    function toggleSaveJob(id, btn) {
        const index = savedJobs.indexOf(id);
        if (index > -1) {
            savedJobs.splice(index, 1);
            btn.textContent = 'Save';
            btn.style.color = '';
            btn.style.borderColor = '';
        } else {
            savedJobs.push(id);
            btn.textContent = 'Saved';
            btn.style.color = 'var(--accent-color)';
            btn.style.borderColor = 'var(--accent-color)';
        }
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }

    function showJobModal(id) {
        const job = allJobs.find(j => j.id === id);
        if (!job) return;

        let modal = document.getElementById('job-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'job-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2 style="font-family: var(--font-heading); font-size: 32px; margin-bottom: 8px;">${job.title}</h2>
                <p class="muted" style="font-size: 18px; margin-bottom: var(--space-3);">${job.company} • ${job.location}</p>
                
                <div class="job-meta">
                    <span class="badge">${job.mode}</span>
                    <span class="badge">${job.experience}</span>
                    <span class="badge-source badge">${job.source}</span>
                    <span class="badge" style="color: var(--success-color)">${job.salaryRange}</span>
                </div>

                <div style="margin-top: var(--space-3);">
                    <h4>Required Skills</h4>
                    <div class="job-meta">
                        ${job.skills.map(s => `<span class="badge">${s}</span>`).join('')}
                    </div>
                </div>

                <div style="margin-top: var(--space-3);">
                    <h4>Description</h4>
                    <p style="margin-top: 8px;">${job.description}</p>
                </div>

                <div style="margin-top: var(--space-4); display: flex; gap: var(--space-2);">
                    <a href="${job.applyUrl}" target="_blank" class="btn btn-primary" style="flex: 1;">Apply Now</a>
                    <button class="btn btn-secondary close-modal-btn" style="flex: 1;">Close</button>
                </div>
            </div>
        `;

        modal.classList.add('active');

        const close = () => modal.classList.remove('active');
        modal.querySelector('.close-modal').onclick = close;
        modal.querySelector('.close-modal-btn').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
    }

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
            if (allJobs.length > 0) renderDashboard();
            else mainContent.innerHTML = '<div class="empty-state">Loading jobs...</div>';
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
        } else if (hash === '#saved') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Saved Collections</h1>
                <p class="subtext">Your curated inventory of high-signal opportunities.</p>
            `;
            if (allJobs.length > 0) renderSaved();
            else mainContent.innerHTML = '<div class="empty-state">Loading jobs...</div>';
        } else if (hash === '#digest') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Weekly Digest</h1>
                <p class="subtext">Your curated inventory of high-signal opportunities.</p>
            `;
            mainContent.innerHTML = `
                <div class="workspace-wrapper">
                    <section class="primary-workspace full-width">
                        <div class="empty-state">
                            <div class="empty-state-icon">✧</div>
                            <h3>Nothing here yet.</h3>
                            <p class="muted">Digests are generated once you have sufficient activity.</p>
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

    fetchJobs();
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

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
