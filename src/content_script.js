/**
 * 显示加载框
 */
function showLoading(dlBtn) {
    dlBtn.querySelector('span[class="loading-animation"]').style.display = "inline-block"
    dlBtn.querySelector('span[class="woo-like-count"]').style.display = "none"
}

/**
 * 隐藏加载框
 */
function hideLoading(dlBtn) {
    dlBtn.querySelector('span[class="loading-animation"]').style.display = "none"
    dlBtn.querySelector('span[class="woo-like-count"]').style.display = "block"
}

function downloadImage(imageUrl, name, dlBtn) {
    this.showLoading(dlBtn);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var blob = new Blob([xhr.response], {
                type: 'image/jpeg'
            });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.hideLoading(dlBtn);
            }, 0);
        }
    };
    // 处理请求被中止的回调
    xhr.onabort = function() {
        this.hideLoading(dlBtn);
    };
    // 处理请求发生错误的回调
    xhr.onerror = function() {
        this.hideLoading(dlBtn);
    };
    xhr.open('GET', imageUrl);
    xhr.responseType = 'arraybuffer';
    xhr.send();
}

function downloadWrapper(url, name, type, item, dlBtn) {
    if (type == 'video') {
        this.showLoading(dlBtn);
        fetch(url).then(function(response) {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error('HTTP status code: ' + response.status);
                }
            })
            .then(function(blob) {
                // 创建下载链接
                var downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = item.downloadFile || name; // 下载文件的名称

                this.hideLoading(dlBtn);
                // 触发点击事件以下载文件
                downloadLink.click();

                // 清理资源
                URL.revokeObjectURL(downloadLink.href);
            })
            .catch(function(error) {
                console.error(error);
            });
    }
    if (type == 'pic') {
        downloadImage(url, item.downloadFile || name, dlBtn);
    }
}

function handleDownloadList(downloadList, dlBtn) {
    for (const item of downloadList) {
        downloadWrapper(item.url, item.name, item.type, item, dlBtn);
    }
}

function getName(nameSetting, originalName, ext, userName, userId, postId, postUid, index, postTime, content) {
    let setName = nameSetting;
    setName = setName.replace('{ext}', ext);
    setName = setName.replace('{original}', originalName);
    setName = setName.replace('{username}', userName);
    setName = setName.replace('{userid}', userId);
    setName = setName.replace('{mblogid}', postId);
    setName = setName.replace('{uid}', postUid);
    setName = setName.replace('{index}', index);
    setName = setName.replace('{content}', content.substring(0, 50));
    let YYYY, MM, DD, HH, mm, ss;
    const postAt = new Date(postTime);
    if (postTime) {
        YYYY = postAt.getFullYear().toString();
        MM = (postAt.getMonth() + 1).toString().padStart(2, '0');
        DD = postAt.getDate().toString().padStart(2, '0');
        HH = postAt.getHours().toString().padStart(2, '0');
        mm = postAt.getMinutes().toString().padStart(2, '0');
        ss = postAt.getSeconds().toString().padStart(2, '0');
    }
    setName = setName.replace('{YYYY}', YYYY);
    setName = setName.replace('{MM}', MM);
    setName = setName.replace('{DD}', DD);
    setName = setName.replace('{HH}', HH);
    setName = setName.replace('{mm}', mm);
    setName = setName.replace('{ss}', ss);
    return setName.replace(/[<|>|*|"|\/|\|:|?|\n]/g, '_');
}

function handleVideo(mediaInfo, padLength, userName, userId, postId, postUid, index, postTime, text, downloadFile, countNum) {
    const newList = [];
    let largeVidUrl = mediaInfo.playback_list ? mediaInfo.playback_list[0].play_info.url : mediaInfo.stream_url;
    let vidName = largeVidUrl.split('?')[0];
    vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
    let originalName = vidName.split('.')[0];
    let ext = vidName.split('.')[1];
    const setName = getName(dlFileName, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(
        padLength, '0'), postTime, text);
    newList.push({
        url: largeVidUrl,
        name: setName,
        type: 'video',
        downloadFile: downloadFile,
        index: index
    });
    if (mediaInfo.hasOwnProperty('pic_info')) {
        let picUrl = mediaInfo.pic_info.pic_big.url;
        let largePicUrl = picUrl.replace('/orj480/', '/large/');
        let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
        let originalName = picName.split('.')[0];
        let ext = picName.split('.')[1];
        const setName = getName(dlFileName, originalName, ext, userName, userId, postId, postUid, index.toString()
            .padStart(padLength, '0'), postTime, text);
        newList.push({
            url: largePicUrl,
            name: setName,
            type: 'pic',
            downloadFile: downloadFile + (countNum > 1 ? (' ' + index) : ''),
            index: index
        });
    }
    return newList;
}

function handlePic(pic, padLength, userName, userId, postId, postUid, index, postTime, text, downloadFile, countNum) {
    let newList = [];
    let largePicUrl = pic.largest.url;
    let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
    let originalName = picName.split('.')[0];
    let ext = picName.split('.')[1];
    const setName = getName(dlFileName, originalName, ext, userName, userId, postId, postUid, index.toString().padStart(
        padLength, '0'), postTime, text);
    newList.push({
        url: largePicUrl,
        name: setName,
        headerFlag: true,
        type: 'pic',
        downloadFile: downloadFile + (countNum > 1 ? (' ' + index) : ''),
        index: index
    });
    if (pic.hasOwnProperty('video')) {
        let videoUrl = pic.video;
        let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
        videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
        if (!videoName.includes('.')) videoName = videoUrl.split('/')[videoUrl.split('/').length - 1].split('?')[0];
        let originalName = videoName.split('.')[0];
        let ext = videoName.split('.')[1];
        const setName = getName(dlFileName, originalName, ext, userName, userId, postId, postUid, index.toString()
            .padStart(padLength, '0'), postTime, text);
        newList.push({
            url: videoUrl,
            name: setName,
            type: 'video',
            downloadFile: downloadFile + (countNum > 1 ? (' ' + index) : '') + '.' + ext,
            index: index
        });
    }
    return newList;
}

function httpGet(theUrl) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getWeiboContent(article) {
    const headerDom = article.getElementsByTagName('header');
    const contentDom = article.querySelector('div[class="wbpro-feed-content"]');

    let userNick = headerDom[0].querySelector('span[title]').innerHTML;
    let publishTime = headerDom[0].querySelectorAll('[class*="_time"]')[0].getAttribute('title')
        .replace(':', '-');
    let weiboCont = contentDom.querySelector('[class*="wbtext"]').textContent;
    let fileName = weiboCont.trim().replace(/^(\u005f)+|(\u005f)+$/ig, '').replace(/^(\u200b)+|(\u200b)+$/ig, '')
        .replace(/^(\\u0020)+|(\\u0020)+$/ig, '').replace(/ (.*?)的微博视频/ig, '').trim().replace(/(.*?)的微博视频/ig, '')
        .replace('分享视频', '');
        
    const emojiRegex = /[^\u4e00-\u9fa5a-zA-Z0-9\s]/igu;
    const lastFileName = fileName.replace(emojiRegex, '').replace(/\s+/g, " ");
    const downloadFileName = (userNick + ' ' + publishTime + (lastFileName ? (' - ' + lastFileName) : ''));
    return downloadFileName;
}

function addDlBtn(footer) {
    let dlBtnDiv = document.createElement('div');
    let divInDiv = document.createElement('div');
    if (footer.getElementsByClassName('_item_198pe_23').length > 0) {
        dlBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D _item_198pe_23 _cursor_198pe_184';
        divInDiv.className =
            'woo-box-flex woo-box-alignCenter woo-box-justifyCenter _likebox_198pe_50 _wrap_198pe_137 _likebox_198pe_50 _wrap_198pe_137';
    } else {
        dlBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D toolbar_cursor_34j5V';
        divInDiv.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_wrap_np6Ug';
    }
    let dlBtn = document.createElement('button');
    dlBtn.className = 'woo-like-main toolbar_btn_Cg9tz download-button';
    dlBtn.setAttribute('tabindex', '0');
    dlBtn.setAttribute('title', '下载');
    dlBtn.innerHTML = '<span class="woo-like-count">下载</span><span class="loading-animation"><span>';
    dlBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        const article = this.parentElement.parentElement.parentElement.parentElement.parentElement
            .parentElement.parentElement;
        const downloadFileName = getWeiboContent(article);
        if (article.tagName.toLowerCase() == 'article') {
            const header = article.getElementsByTagName('header')[0];
            postLink = header.getElementsByClassName('_time_1tpft_33')[0];
            if (header.getElementsByClassName('_time_1tpft_33').length > 0) {
                postLink = header.getElementsByClassName('_time_1tpft_33')[0];
            } else {
                postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
            }
            let postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
            var response;
            if (location.host == 'www.weibo.com') {
                response = httpGet('https://www.weibo.com/ajax/statuses/show?id=' + postId);
            } else {
                response = httpGet('https://weibo.com/ajax/statuses/show?id=' + postId);
            }
            const resJson = JSON.parse(response);
            let status = resJson;
            if (resJson.hasOwnProperty('retweeted_status')) {
                status = resJson.retweeted_status;
            }
            postId = status.mblogid;
            const picInfos = status.pic_infos;
            const mixMediaInfo = status.mix_media_info;
            const userName = status.user.screen_name;
            const userId = status.user.idstr;
            const postUid = status.idstr;
            const postTime = status.created_at;
            const text = status.text_raw;
            let downloadList = [];
            if (footer.parentElement.getElementsByTagName('video').length > 0) {
                if (resJson.hasOwnProperty('page_info')) {
                    downloadList = downloadList.concat(handleVideo(resJson.page_info.media_info, 1,
                        userName, userId, postId, postUid, 1, postTime, text, downloadFileName));
                }
            }
            if (picInfos) {
                let index = 0;
                let padLength = Object.entries(picInfos).length.toString().length;
                let countNum = Object.keys(picInfos).length;
                for (const [id, pic] of Object.entries(picInfos)) {
                    index += 1;
                    downloadList = downloadList.concat(handlePic(pic, padLength, userName, userId, postId,
                        postUid, index, postTime, text, downloadFileName, countNum));
                }
            }
            if (mixMediaInfo && mixMediaInfo.items) {
                let index = 0;
                let padLength = Object.entries(mixMediaInfo.items).length.toString().length;
                let countNum = Object.keys(mixMediaInfo.items).length;
                for (const [id, media] of Object.entries(mixMediaInfo.items)) {
                    index += 1;
                    if (media.type === 'video') {
                        downloadList = downloadList.concat(handleVideo(media.data.media_info, 1, userName,
                            userId, postId, postUid, index, postTime, text, downloadFileName, countNum));
                    } else if (media.type === 'pic') {
                        downloadList = downloadList.concat(handlePic(media.data, padLength, userName,
                            userId, postId, postUid, index, postTime, text, downloadFileName, countNum));
                    }
                }
            }
            console.log('downloadList=',downloadList)
            handleDownloadList(downloadList, dlBtn);
        }
    });
    divInDiv.appendChild(dlBtn);
    dlBtnDiv.appendChild(divInDiv);
    footer.firstElementChild.firstElementChild.firstElementChild.appendChild(dlBtnDiv);
}

function sAddDlBtn(footer) {
    const lis = footer.getElementsByTagName('li');
    for (const li of lis) {
        li.style.width = '25%';
    }
    let dlBtnLi = document.createElement('li');
    dlBtnLi.style.width = '25%';
    let aInLi = document.createElement('a');
    aInLi.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter';
    aInLi.setAttribute('title', '下载');
    aInLi.setAttribute('href', 'javascript:void(0);');
    let dlBtn = document.createElement('button');
    dlBtn.className = 'woo-like-main toolbar_btn download-button';
    dlBtn.innerHTML = '<span class="woo-like-count">下载</span><span class="loading-animation"><span>';
    aInLi.addEventListener('click', function(event) {
        event.preventDefault();
    });
    dlBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const card = this.parentElement.parentElement.parentElement.parentElement;
        const cardWrap = card.parentElement;
        const mid = cardWrap.getAttribute('mid');
        const downloadFileName = getWeiboContent(cardWrap);
        if (mid) {
            var response;
            if (location.host == 'www.weibo.com') {
                response = httpGet('https://www.weibo.com/ajax/statuses/show?id=' + mid);
            } else {
                response = httpGet('https://weibo.com/ajax/statuses/show?id=' + mid);
            }
            const resJson = JSON.parse(response);
            // console.log(resJson);
            let status = resJson;
            if (resJson.hasOwnProperty('retweeted_status')) {
                status = resJson.retweeted_status;
            }
            const postId = status.mblogid;
            const picInfos = status.pic_infos;
            const mixMediaInfo = status.mix_media_info;
            const userName = status.user.screen_name;
            const userId = status.user.idstr;
            const postUid = status.idstr;
            const postTime = status.created_at;
            const text = status.text_raw;
            let downloadList = [];
            if (footer.parentElement.getElementsByTagName('video').length > 0) {
                // console.log('download video');
                if (resJson.hasOwnProperty('page_info')) {
                    downloadList = downloadList.concat(handleVideo(resJson.page_info.media_info, 1, userName,
                        userId, postId, postUid, 1, postTime, text, downloadFileName));
                }
            }
            if (picInfos) {
                // console.log('download images');
                let index = 0;
                let padLength = Object.entries(picInfos).length.toString().length;
                let countNum = Object.keys(picInfos).length;
                for (const [id, pic] of Object.entries(picInfos)) {
                    index += 1;
                    downloadList = downloadList.concat(handlePic(pic, padLength, userName, userId, postId,
                        postUid, index, postTime, text, downloadFileName, countNum));
                }
            }
            if (mixMediaInfo && mixMediaInfo.items) {
                // console.log('mix media');
                let index = 0;
                let padLength = Object.entries(mixMediaInfo.items).length.toString().length;
                let countNum = Object.keys(mixMediaInfo.items).length;
                for (const [id, media] of Object.entries(mixMediaInfo.items)) {
                    index += 1;
                    if (media.type === 'video') {
                        downloadList = downloadList.concat(handleVideo(media.data.media_info, 1, userName,
                            userId, postId, postUid, index, postTime, text, downloadFileName, countNum));
                    } else if (media.type === 'pic') {
                        downloadList = downloadList.concat(handlePic(media.data, padLength, userName, userId,
                            postId, postUid, index, postTime, text, downloadFileName, countNum));
                    }
                }
            }

            handleDownloadList(downloadList, dlBtn);
        }
    });
    aInLi.appendChild(dlBtn);
    dlBtnLi.appendChild(dlBtn);
    footer.firstChild.appendChild(dlBtnLi);
    // console.log('added download button');
}

function bodyMouseOver(event) {
    if (location.host == 'weibo.com' || location.host == 'www.weibo.com') {
        const footers = document.getElementsByTagName('footer');
        for (const footer of footers) {
            if (footer.getElementsByClassName('download-button').length > 0) {} else {
                if (footer.parentElement.tagName.toLowerCase() == 'article') {
                    const article = footer.parentElement;
                    const imgs = article.getElementsByTagName('img');
                    let added = false;
                    if (imgs.length > 0) {
                        let addFlag = false;
                        for (const img of imgs) {
                            if (['woo-picture-img', 'picture_focusImg_1z5In', 'picture-viewer_pic_37YQ3',
                                    '_focusImg_a2k8z_23'
                                ].includes(img.className)) {
                                addFlag = true;
                            }
                        }
                        if (addFlag == true) {
                            addDlBtn(footer);
                            added = true;
                        }
                    }
                    let videos = article.getElementsByTagName('video');
                    if (videos.length > 0 && added == false) {
                        addDlBtn(footer);
                    }
                }
            }
        }
    }
    if (location.host == 's.weibo.com') {
        const footers = document.querySelectorAll('#pl_feedlist_index .card-act');
        for (const footer of footers) {
            if (footer.getElementsByClassName('download-button').length > 0) {} else {
                if (footer.parentElement.className == 'card' && footer.parentElement.parentElement.className ==
                    'card-wrap') {
                    const card = footer.parentElement;
                    let added = false;
                    const media_prev = card.querySelector('div[node-type="feed_list_media_prev"]');
                    if (media_prev) {
                        const imgs = media_prev.getElementsByTagName('img');
                        if (imgs.length > 0) {
                            sAddDlBtn(footer);
                            added = true;
                        }
                        const videos = card.getElementsByTagName('video');
                        if (videos.length > 0 && added == false) {
                            sAddDlBtn(footer);
                        }
                    }
                }
            }
        }
    }
}

var dlFileName = '{original}.{ext}';


document.addEventListener('DOMContentLoaded', function() {
    var style = document.createElement('style');
    style.textContent = `
    .loading-animation {
        display:none;
        width:16px;
        height: 16px;
        border: 1px solid #e8e8e8;
        border-radius: 50%;
        border-top: 1px solid #3498db;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);

    // console.log('我被执行了！');
    document.body.addEventListener('mouseover', bodyMouseOver);
});