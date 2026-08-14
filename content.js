// Common data
const FEEDBACK_TEXT = `Dear Facebook Support Team,
My account was suspended without providing me with a clear explanation for the alleged violation. 
I therefore believe this may be a mistake. I have always respected the community guidelines and 
applicable policies while using the platform. This account is very important to me, as it contains 
personal and work‑related information. I have already submitted all the required documentation to 
verify my identity. I kindly ask you to carefully review my situation and restore my account as 
soon as possible. Thank you for your time and support.`;
const SUBJECT_TEXT = 'Urgent request to review and unblock my Facebook account in error';
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  // … (same list as in the Python script, truncated for brevity)
];

// Helper: wait for element
const waitFor = (sel, timeout = 8000) => new Promise((res, rej) => {
  const interval = setInterval(() => {
    const el = document.querySelector(sel);
    if (el) {
      clearInterval(interval);
      res(el);
    }
  }, 200);
  setTimeout(() => {
    clearInterval(interval);
    rej(new Error('timeout'));
  }, timeout);
});

// ---------- FORM HANDLERS ----------
async function submitForm1() {
  const email = await getEmail();
  await waitFor("input[name='email'],input._5whq.input");
  document.querySelector("input[name='email'],input._5whq.input").value = email;
  document.querySelector("select[name='customField1']").value = 'other';
  await waitFor("textarea[name='details'],textarea._5whq.input");
  document.querySelector("textarea[name='details'],textarea._5whq.input").value = FEEDBACK_TEXT;
  document.querySelector("button[type='submit'],button._54k8").click();
}

async function submitForm2() {
  const email = await getEmail();
  await waitFor("input[name='email'],input._5whq.input");
  document.querySelector("input[name='email'],input._5whq.input").value = email;
  await waitFor("textarea[name='details'],textarea._5whq.input");
  document.querySelector("textarea[name='details'],textarea._5whq.input").value = FEEDBACK_TEXT;
  document.querySelector("button[type='submit'],button._54k8").click();
}

async function submitForm3() {
  const email = await getEmail();
  await waitFor("input[name='Subject'],input._5whq.input");
  document.querySelector("input[name='Subject'],input._5whq.input").value = SUBJECT_TEXT;
  document.querySelector("input[name='email'],input._5whq.input").value = email;
  await waitFor("textarea[name='Field329469473763840'],textarea._5whq.input");
  document.querySelector("textarea[name='Field329469473763840'],textarea._5whq.input").value = FEEDBACK_TEXT;
  // click "No" radio
  const noRadio = document.querySelector("input[name='Field276502132414825'][value='No']");
  if (noRadio) noRadio.click();
  document.querySelector("button[type='submit'],button._54k8").click();
}

async function submitForm4() {
  const email = await getEmail();
  // dropdowns
  await selectMetaDropdown("Product (required field)", "Facebook");
  await selectMetaDropdown("Feature", "Account");
  await selectMetaDropdown("Your device", "Android");
  // feedback textarea
  await waitFor("textarea[placeholder='Please provide as much detail as possible.'],textarea[aria-required='true']");
  const ta = document.querySelector("textarea[placeholder='Please provide as much detail as possible.'],textarea[aria-required='true']");
  ta.value = FEEDBACK_TEXT;
  // submit
  document.querySelector("span.x1heor9g,button[type='submit'],button[value='Send']").click();
}

// ---------- REFRESH LOOP ----------
async function refreshLoop(times = 10) {
  for (let i = 0; i < times; i++) {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    // Chrome does not allow changing UA from a content script – use fetch as a proxy
    // Here we simply reload the page; UA is whatever the browser uses
    location.reload();
    await new Promise(r => setTimeout(r, 1200));
  }
}

// ---------- HELPERS ----------
async function getEmail() {
  const data = await chrome.storage.local.get('email');
  return data.email || '';
}

async function selectMetaDropdown(label, option) {
  await waitFor(`//*[@aria-label='${label}']`);
  const combobox = document.querySelector(`[aria-label='${label}']`);
  combobox.click();
  await new Promise(r => setTimeout(r, 600));
  const opt = Array.from(document.querySelectorAll('[role="option"]'))
    .find(o => o.textContent.trim() === option);
  if (opt) opt.click();
}

// ---------- MAIN ----------
(async () => {
  const url = location.href;

  if (url.includes('/help/contact/268228883256323')) {
    await submitForm1();
    chrome.runtime.sendMessage({ type: 'formSubmitted' });
  } else if (url.includes('/help/contact/507287962650443')) {
    await submitForm2();
    chrome.runtime.sendMessage({ type: 'formSubmitted' });
  } else if (url.includes('/help/contact/288611514529252')) {
    await submitForm3();
    chrome.runtime.sendMessage({ type: 'formSubmitted' });
  } else if (url.includes('/help/policies/707685072208748')) {
    await submitForm4();
    chrome.runtime.sendMessage({ type: 'formSubmitted' });
  } else if (url.includes('facebook.com') && !url.includes('help')) {
    // we are on Facebook home after all forms
    await refreshLoop(10);
    chrome.runtime.sendMessage({ type: 'refreshDone' });
  }
})();
