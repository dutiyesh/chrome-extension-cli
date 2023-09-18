'use strict';

import './sidepanel.css';

(function () {
  function initList(tabs) {
    const list = document.getElementById('tabs-list');

    const listItem = tabs.map((tab) => {
      return `
      <li>
        <div data-tab-id="${tab.id}" class="tab-container">
          ${
            tab.favIconUrl
              ? `<img src="${tab.favIconUrl}" alt="" class="tab-image" />`
              : '<span class="tab-image tab-image-placeholder">&#x2750;</span>'
          }
          <p class="tab-title" title="${tab.title}">${tab.title}</p>
        </div>
      </li>
      `;
    });

    list.innerHTML = listItem.join('\n');

    list.addEventListener('click', (event) => {
      if (event.target && event.target.closest('.tab-container')) {
        const tabId = event.target
          .closest('.tab-container')
          .getAttribute('data-tab-id');

        chrome.tabs.update(Number(tabId), {
          active: true,
        });
      }
    });
  }

  function setupTabList() {
    chrome.tabs.query(
      {
        currentWindow: true,
      },
      (tabs) => {
        initList(tabs);
      }
    );
  }

  function setupTabListeners() {
    chrome.tabs.onCreated.addListener(setupTabList);
    chrome.tabs.onMoved.addListener(setupTabList);
    chrome.tabs.onRemoved.addListener(setupTabList);
    chrome.tabs.onUpdated.addListener(setupTabList);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupTabList();
    setupTabListeners();
  });

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Syd. I am from SidePanel.',
      },
    },
    (response) => {
      console.log(response.message);
    }
  );
})();
