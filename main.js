// KodNest Premium Build System - Core Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('KodNest Premium Build System Initialized');

    // Example Copy Prompt Logic
    const copyBtn = document.querySelector('.secondary-panel .btn-secondary');
    if (copyBtn && copyBtn.textContent.includes('Copy')) {
        copyBtn.addEventListener('click', () => {
            const promptText = document.querySelector('.prompt-box p').textContent;
            navigator.clipboard.writeText(promptText).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        });
    }

    // Toggle Checklist States (Visual only for now)
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
