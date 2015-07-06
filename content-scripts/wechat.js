chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    if ((msg.from === 'popup') && (msg.subject === 'GET_CONTACT_LIST')) {
        var contactButton = document.querySelector('.tab_item.no_extra a.chat');
        contactButton.click();

        contact = [];
        contact_username_list = [];
        var contactWrapper = document.querySelector('.contact_list.scroll-content');
        contactWrapper.scrollTop = 0; // start from top most
        var length = parseInt(document.querySelector('.contact_list .bottom-placeholder').style.height);
        var i = 0;
        getContact(i);

        // functions
        function getContact(i) {
            setTimeout(function() {
                contactWrapper.scrollTop = i;
                i = i + 10;
                var items = document.querySelectorAll('.contact_item');
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    var nickname = item.querySelector('h4.nickname').textContent;
                    var username = item.querySelector('img').src.match(/username=(.*)\&/)[1];
                    var newContact = {
                        username, nickname
                    };
                    if (contact_username_list.indexOf(username) === -1) {
                        contact.push(newContact);
                        contact_username_list.push(username);
                    }
                }
                if (i < length) {
                    // continue loop
                    getContact(i, contactWrapper, contact, length);
                } else {
                    contactWrapper.scrollTop = 0; // go back to top most
                    // store contact list to local
                    if (contact) {
                        storeContactList(contact, function() {
                            chrome.runtime.sendMessage({
                                from: 'content',
                                subject: 'CONTACT_LIST_DONE'
                            });
                        });
                    }
                }
            }, 4);
        }
    }

    if ((msg.from === 'popup') && (msg.subject === 'SEND_MESSAGE')) {
        var nickname = msg.nickname;
        // search friend
        var input = document.querySelector('.frm_search');
        input.value = '';
        var te = document.createEvent('TextEvent');
        te.initTextEvent('textInput', true, true, window, nickname);
        input.dispatchEvent(te);

        // get result
        setTimeout(function() {
            var result = document.querySelectorAll('.search_bar .contact_item');
            for (var i = 0; i < result.length; i++) {
                var nk = result[i].querySelector('h4.nickname').textContent;
                if (nk === nickname) {
                    result[i].click();
                    // send msg
                    var editArea = document.querySelector('#editArea');
                    editArea.focus();
                    var msg = document.createEvent('TextEvent');
                    msg.initTextEvent('textInput', true, true, window, '你好吗');
                    editArea.dispatchEvent(msg);
                    var sendBtn = document.querySelector('.btn_send');
                    sendBtn.click();
                }
            }
        }, 500);
    }
});

function injectElem() {
    var overLay_ = createElemWithClass('div', 'overlay');
    document.body.append(overLay_);
}

function createElemWithClass(div, className) {
    var _ = document.createElement(div);
    _.className = className;
    return _;
}

function storeContactList(contact, callback) {
    chrome.storage.local.set({
        'contact_list': contact
    }, function() {
        callback();
    });
}
