$(function() {
    if (findContactList()) {
        buildContactList();
    }

    $('button.get-contact-list-button').on('click', function() {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                from: 'popup',
                subject: 'GET_CONTACT_LIST'
            });
        });
    });

    chrome.runtime.onMessage.addListener(function(msg, sender, response) {
        if ((msg.from === 'content') && (msg.subject === 'CONTACT_LIST_DONE')) {
            buildContactList();
            buildGreeting();
        }
    });
});

function buildContactList() {
    chrome.storage.local.get('contact_list', function(result) {
        if (typeof result === 'undefined') {
            return;
        }
        // clear the result list
        $('.contact-list').empty();

        // for each result in db
        // build a contact item as a list
        $.each(result['contact_list'], function(key, value) {
            $('.contact-list').append('<a href="#" class="list-group-item contact-item" data-username="' + value['username'] + '" data-nickname="' + value['nickname'] + '">' + value['nickname'] + '</a>');
        });

        // if click contact item
        // send a message to send message
        $('body').on('click', '.contact-item', function(e) {
            var nickname = $(this).data('nickname');
            e.preventDefault();
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    from: 'popup',
                    subject: 'SEND_MESSAGE',
                    nickname: nickname
                });
            });
        });
    });
}

function findContactList() {
    if (document.querySelector('.contact-list') === null) {
        return false;
    } else {
        return true;
    }
}
