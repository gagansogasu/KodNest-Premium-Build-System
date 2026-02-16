// KodNest Premium Build System - Core Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('KodNest Premium Build System Initialized');

    // Simple Router
    let allJobs = [];
    let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let preferences = JSON.parse(localStorage.getItem('jobTrackerPreferences') || 'null');
    let showOnlyMatches = false;

    async function fetchJobs() {
        try {
            const response = await fetch('jobs.json');
            allJobs = await response.json();
            handleRoute();
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }

    function calculateMatchScore(job) {
        if (!preferences) return 0;
        let score = 0;

        // 1. Role Keywords (+25 Title, +15 Description)
        const keywords = preferences.roleKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
        const title = job.title.toLowerCase();
        const desc = job.description.toLowerCase();

        if (keywords.some(k => title.includes(k))) score += 25;
        else if (keywords.some(k => desc.includes(k))) score += 15;

        // 2. Locations (+15)
        if (preferences.preferredLocations.includes(job.location)) score += 15;

        // 3. Mode (+10)
        if (preferences.preferredMode.includes(job.mode)) score += 10;

        // 4. Experience (+10)
        if (job.experience === preferences.experienceLevel) score += 10;

        // 5. Skills Overlap (+15)
        const userSkills = preferences.skills.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
        const jobSkills = job.skills.map(s => s.toLowerCase());
        if (userSkills.some(s => jobSkills.includes(s))) score += 15;

        // 6. Recency (+5)
        if (job.postedDaysAgo <= 2) score += 5;

        // 7. Source (+5)
        if (job.source === 'LinkedIn') score += 5;

        return Math.min(100, score);
    }

    function getScoreClass(score) {
        if (!preferences) return 'score-none';
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-med';
        if (score >= 40) return 'score-low';
        return 'score-none';
    }

    function createJobCard(job) {
        const isSaved = savedJobs.includes(job.id);
        const score = calculateMatchScore(job);
        const scoreClass = getScoreClass(score);

        return `
            <div class="job-card" data-id="${job.id}">
                ${preferences ? `<div class="match-badge ${scoreClass}">${score}</div>` : ''}
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
                        <button class="btn btn-secondary btn-sm view-job" style="padding: 8px 12px;">View</button>
                        <button class="btn btn-secondary btn-sm save-job" style="padding: 8px 12px; ${isSaved ? 'color: var(--accent-color); border-color: var(--accent-color);' : ''}">
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
                        <option value="score">Match Score</option>
                        <option value="salary">High Salary</option>
                    </select>
                </div>
                ${preferences ? `
                <div class="filter-group" style="margin-left: auto;">
                    <label class="toggle-group">
                        <input type="checkbox" id="match-toggle" ${showOnlyMatches ? 'checked' : ''}>
                        Show only matches (>${preferences.minMatchScore})
                    </label>
                </div>
                ` : ''}
            </div>
        `;
    }

    function renderDashboard() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div style="padding: 0 var(--space-3) var(--space-5);">
                ${!preferences ? `
                    <div class="preference-banner">
                        <span>Set your preferences to activate intelligent matching.</span>
                        <a href="#settings" class="btn btn-secondary btn-sm">Configure</a>
                    </div>
                ` : ''}
                ${renderFilterBar()}
                <div id="job-list" class="job-grid"></div>
            </div>
        `;

        updateJobList();

        ['search-input', 'location-filter', 'mode-filter', 'exp-filter', 'sort-filter', 'match-toggle'].forEach(id => {
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
        const matchToggle = document.getElementById('match-toggle')?.checked || false;
        showOnlyMatches = matchToggle;

        let filtered = allJobs.map(job => ({ ...job, _score: calculateMatchScore(job) }));

        filtered = filtered.filter(job => {
            const matchesQuery = job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query);
            const matchesLoc = loc === '' || job.location === loc;
            const matchesMode = mode === '' || job.mode === mode;
            const matchesExp = exp === '' || job.experience === exp;
            const matchesThreshold = !matchToggle || !preferences || job._score >= preferences.minMatchScore;

            return matchesQuery && matchesLoc && matchesMode && matchesExp && matchesThreshold;
        });

        if (sort === 'latest') {
            filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
        } else if (sort === 'score') {
            filtered.sort((a, b) => b._score - a._score);
        } else if (sort === 'salary') {
            const getVal = (s) => {
                const match = s.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            filtered.sort((a, b) => getVal(b.salaryRange) - getVal(a.salaryRange));
        }

        const jobList = document.getElementById('job-list');
        if (jobList) {
            if (filtered.length === 0) {
                jobList.innerHTML = `
                    <div class="empty-state full-width" style="grid-column: 1 / -1;">
                        <div class="empty-state-icon">◈</div>
                        <h3>No matches found.</h3>
                        <p class="muted">Adjust filters or lower your matching threshold.</p>
                    </div>
                `;
            } else {
                jobList.innerHTML = filtered.map(job => createJobCard(job)).join('');
                attachJobActions();
            }
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
                        ${filtered.map(job => createJobCard(job)).join('')}
                    </div>
                </div>
            `;
            attachJobActions();
        }
    }

    function attachJobActions() {
        document.querySelectorAll('.view-job').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.target.closest('.job-card').dataset.id);
                showJobModal(id);
            };
        });

        document.querySelectorAll('.save-job').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.target.closest('.job-card').dataset.id);
                toggleSaveJob(id, btn);
            };
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

        const score = calculateMatchScore(job);
        const scoreClass = getScoreClass(score);

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                    <h2 style="font-family: var(--font-heading); font-size: 32px; margin: 0;">${job.title}</h2>
                    ${preferences ? `<div class="match-badge ${scoreClass}" style="position: static;">${score}</div>` : ''}
                </div>
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

    function renderSettings() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const p = preferences || {
            roleKeywords: '',
            preferredLocations: [],
            preferredMode: ['Remote'],
            experienceLevel: 'Fresher',
            skills: '',
            minMatchScore: 40
        };

        mainContent.innerHTML = `
            <div class="workspace-wrapper">
                <section class="primary-workspace" style="flex: 0 0 100%;">
                    <div class="card">
                        <h3>Preference Profile</h3>
                        <div class="form-grid">
                            <div class="input-group">
                                <label class="label">Role Keywords (comma separated)</label>
                                <input type="text" id="pref-keywords" value="${p.roleKeywords}" placeholder="e.g. Frontend, React, Intern">
                            </div>
                            <div class="input-group">
                                <label class="label">Preferred Locations</label>
                                <select id="pref-locations" class="filter-input full-width" multiple style="height: 80px;">
                                    ${['Bangalore', 'Mumbai', 'Chennai', 'Gurgaon', 'Noida', 'Pune', 'Hyderabad', 'Remote'].map(l =>
            `<option value="${l}" ${p.preferredLocations.includes(l) ? 'selected' : ''}>${l}</option>`
        ).join('')}
                                </select>
                            </div>
                            <div class="input-group">
                                <label class="label">Working Mode</label>
                                <div style="display: flex; gap: var(--space-2); margin-top: 8px;">
                                    ${['Remote', 'Hybrid', 'Onsite'].map(m => `
                                        <label class="toggle-group">
                                            <input type="checkbox" class="pref-mode" value="${m}" ${p.preferredMode.includes(m) ? 'checked' : ''}> ${m}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="input-group">
                                <label class="label">Experience Level</label>
                                <select id="pref-exp" class="filter-input full-width">
                                    ${['Fresher', '0-1', '1-3', '3-5'].map(e =>
            `<option value="${e}" ${p.experienceLevel === e ? 'selected' : ''}>${e}</option>`
        ).join('')}
                                </select>
                            </div>
                            <div class="input-group">
                                <label class="label">Skills (comma separated)</label>
                                <input type="text" id="pref-skills" value="${p.skills}" placeholder="e.g. Java, Python, SQL">
                            </div>
                            <div class="input-group">
                                <label class="label">Min Match Score Threshold: <span id="threshold-val">${p.minMatchScore}</span></label>
                                <input type="range" id="pref-threshold" min="0" max="100" value="${p.minMatchScore}">
                            </div>
                        </div>
                    </div>
                    <button id="save-preferences" class="btn btn-primary">Save Preferences</button>
                </section>
            </div>
        `;

        document.getElementById('pref-threshold').oninput = (e) => {
            document.getElementById('threshold-val').textContent = e.target.value;
        };

        document.getElementById('save-preferences').onclick = () => {
            const newPrefs = {
                roleKeywords: document.getElementById('pref-keywords').value,
                preferredLocations: Array.from(document.getElementById('pref-locations').selectedOptions).map(o => o.value),
                preferredMode: Array.from(document.querySelectorAll('.pref-mode:checked')).map(i => i.value),
                experienceLevel: document.getElementById('pref-exp').value,
                skills: document.getElementById('pref-skills').value,
                minMatchScore: parseInt(document.getElementById('pref-threshold').value)
            };
            preferences = newPrefs;
            localStorage.setItem('jobTrackerPreferences', JSON.stringify(newPrefs));
            alert('Preferences saved successfully.');
            handleRoute();
        };
    }

    function generateDigest() {
        if (!preferences) return;

        const dateKey = new Date().toISOString().split('T')[0];
        const storageKey = `jobTrackerDigest_${dateKey}`;

        let existing = localStorage.getItem(storageKey);
        if (existing) {
            renderDigest(JSON.parse(existing));
            return;
        }

        // Rank jobs: matchScore desc, then postedDaysAgo asc
        const ranked = allJobs.map(job => ({
            ...job,
            _score: calculateMatchScore(job)
        }))
            .filter(job => job._score > 0)
            .sort((a, b) => b._score - a._score || a.postedDaysAgo - b.postedDaysAgo)
            .slice(0, 10);

        if (ranked.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(ranked));
            renderDigest(ranked);
        } else {
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✧</div>
                    <h3>No matching roles today.</h3>
                    <p class="muted">Check again tomorrow or adjust your preferences.</p>
                </div>
            `;
        }
    }

    function renderDigest(digest) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        mainContent.innerHTML = `
            <div style="padding: 0 var(--space-3) var(--space-5);">
                <div class="digest-actions">
                    <button id="copy-digest" class="btn btn-secondary btn-sm">Copy Digest to Clipboard</button>
                    <button id="email-digest" class="btn btn-secondary btn-sm">Create Email Draft</button>
                </div>

                <div class="digest-container">
                    <div class="digest-header">
                        <h2>Top Jobs For You</h2>
                        <p class="muted">9AM Digest — ${dateStr}</p>
                    </div>
                    <div class="digest-body">
                        ${digest.map(job => `
                            <div class="digest-item">
                                <div class="digest-item-content">
                                    <h4>${job.title} at ${job.company}</h4>
                                    <p>${job.location} • ${job.experience} • ${job._score}% Match</p>
                                </div>
                                <a href="${job.applyUrl}" target="_blank" class="btn btn-primary btn-sm" style="padding: 6px 12px; font-size: 12px;">Apply</a>
                            </div>
                        `).join('')}
                    </div>
                    <div class="digest-footer">
                        <p>This digest was generated based on your preferences.</p>
                        <p class="muted" style="margin-top: 4px; font-style: italic;">Demo Mode: Daily 9AM trigger simulated manually.</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('copy-digest').onclick = () => {
            const text = digest.map(j => `${j.title} | ${j.company} | ${j.location} | Match: ${j._score}%\nApply: ${j.applyUrl}`).join('\n\n');
            navigator.clipboard.writeText(`9AM Job Digest - ${dateStr}\n\n${text}\n\nGenerated by KodNest Job Tracker`).then(() => {
                alert('Digest copied to clipboard!');
            });
        };

        document.getElementById('email-digest').onclick = () => {
            const body = digest.map(j => `${j.title} at ${j.company} (${j.location})\nMatch Score: ${j._score}%\nApply: ${j.applyUrl}`).join('\n\n');
            const mailto = `mailto:?subject=My 9AM Job Digest - ${dateStr}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;
        };
    }

    function handleRoute() {
        const hash = window.location.hash || '';
        const mainContent = document.getElementById('main-content');
        const contextHeader = document.querySelector('.context-header');

        if (!mainContent || !contextHeader) return;

        contextHeader.style.display = 'block';
        mainContent.innerHTML = '';

        if (hash === '' || hash === '#home' || hash === '#dashboard') {
            const showLanding = hash === '' || hash === '#home';
            if (showLanding && !preferences) {
                contextHeader.style.display = 'none';
                mainContent.innerHTML = `
                    <section class="hero-section">
                        <h1>Stop Missing The Right Jobs.</h1>
                        <p class="subtext">Precision-matched job discovery delivered daily at 9AM.</p>
                        <a href="#settings" class="btn btn-primary" style="margin-top: var(--space-3);">Start Tracking</a>
                    </section>
                `;
            } else {
                contextHeader.innerHTML = `
                    <h1 id="page-title">Personalized Discovery</h1>
                    <p class="subtext">Your matches are ranked by intent and profile alignment.</p>
                `;
                if (allJobs.length > 0) renderDashboard();
            }
        } else if (hash === '#saved') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Saved Collections</h1>
                <p class="subtext">Your curated inventory of high-signal opportunities.</p>
            `;
            if (allJobs.length > 0) renderSaved();
        } else if (hash === '#settings') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Preference Profile</h1>
                <p class="subtext">Define your search parameters. Our system prioritizes intent over volume.</p>
            `;
            renderSettings();
        } else if (hash === '#digest') {
            contextHeader.innerHTML = `
                <h1 id="page-title">Weekly Digest</h1>
                <p class="subtext">Intelligent summary of your top matches this week.</p>
            `;

            if (!preferences) {
                mainContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔒</div>
                        <h3>Set preferences to generate a personalized digest.</h3>
                        <a href="#settings" class="btn btn-secondary" style="margin-top: var(--space-2);">Configure Preferences</a>
                    </div>
                `;
            } else {
                const dateKey = new Date().toISOString().split('T')[0];
                const storageKey = `jobTrackerDigest_${dateKey}`;
                const existing = localStorage.getItem(storageKey);

                if (existing) {
                    renderDigest(JSON.parse(existing));
                } else {
                    mainContent.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">✉</div>
                            <h3>Simulate Morning Digest</h3>
                            <p class="muted">Generate your 9AM snapshot of the most relevant opportunities.</p>
                            <button id="gen-digest-btn" class="btn btn-primary" style="margin-top: var(--space-3);">Generate Today's 9AM Digest (Simulated)</button>
                        </div>
                    `;
                    document.getElementById('gen-digest-btn').onclick = generateDigest;
                }
            }
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
