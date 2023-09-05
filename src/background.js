chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.type === "download_video") {
            let newTabId;
            chrome.tabs.create({url: request.url}, function(tab) {
                newTabId = tab.id;
            });
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                if (tabId === newTabId && changeInfo.status === 'complete') {
                    chrome.downloads.download({url: request.url, filename: request.filename}, function() {
                        chrome.tabs.remove(tabId);
                    });
                }
            });
            sendResponse("ok");
        }

    }
);