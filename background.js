// Keep track of progress
const FORM_ORDER = [
  'https://www.facebook.com/help/contact/268228883256323', // Form1
  'https://www.facebook.com/help/contact/507287962650443', // Form2
  'https://www.facebook.com/help/contact/288611514529252', // Form3
  'https://www.meta.com/help/policies/707685072208748/'   // Form4
];

let currentStep = 0;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'formSubmitted') {
    currentStep++;

    if (currentStep < FORM_ORDER.length) {
      // Open next form in the same tab
      chrome.tabs.update(sender.tab.id, {
        url: FORM_ORDER[currentStep]
      });
    } else {
      // All forms done – start refresh cycle
      chrome.tabs.update(sender.tab.id, {
        url: 'https://www.facebook.com/'
      }, () => {
        // After FB loads, trigger refreshes via content script
        chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          func: () => chrome.runtime.sendMessage({ type: 'startRefresh' })
        });
      });
    }
  }

  if (msg.type === 'refreshDone') {
    // 10 refreshes finished – notify the user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '282 CHDS BYPASS',
      message: 'All 8 appeals submitted. Browser stays open.'
    });
  }

  sendResponse();
});
