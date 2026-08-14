const startBtn = document.getElementById('start');
const emailInput = document.getElementById('email');
const statusDiv = document.getElementById('status');

startBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  if (!email) {
    alert('Please enter your e‑mail.');
    return;
  }

  // Store e‑mail in chrome.storage so content scripts can read it
  await chrome.storage.local.set({ email });

  // Start the automation: open the first form in a new tab
  await chrome.tabs.create({
    url: 'https://www.facebook.com/help/contact/268228883256323',
    active: true
  });

  statusDiv.textContent = 'Starting…';
});
