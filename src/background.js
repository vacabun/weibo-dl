chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.type === "download_video") {
            chrome.downloads.download({
                url: request.url,
                filename: request.filename
            });
            sendResponse("ok");
        }

    }
);