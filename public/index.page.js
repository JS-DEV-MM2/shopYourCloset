'use strict';
let STATE = {
};


// all these modules are defined in /public/utilities
const HTTP = window.HTTP_MODULE;
const RENDER = window.RENDER_MODULE;
const CACHE = window.CACHE_MODULE;
const ETC = window.ETC_MODULE;

function onPageLoad() {
    updateAuthenticatedUI();
}

function updateAuthenticatedUI() {
    const authUser = CACHE.getAuthenticatedUserFromCache();
    if (authUser) {
        STATE.authUser = authUser;
        $('#nav-greeting').html(`Welcome, ${authUser.name}`);
        $('#auth-menu').removeAttr('hidden');
    } else {
        RENDER.renderLoginForm();
    }
}


// ***** LISTENERS


// listeners for registration and login

function onRegisterNewUserClick() {
    $(document).on('submit', '#registration-form', function(event){
        event.preventDefault();
        const userData = {
            name: $('#new-name').val(),
            email: $('#new-email').val(),
            username: $('#new-username').val(),
            password: $("#new-pass").val()
        };

        const newUserUrl = '/api/user/';
        const newUserSettings = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json; charset=utf-8",
            },
            "body": JSON.stringify(userData)
        };
        HTTP.genericFetch(newUserUrl, newUserSettings, renderLoginForm);  
    });
}




function onSigninClick() {
    $(document).on('click', '#signin-btn', function(event) {
        event.preventDefault();
        //$('#error-msg').html();

        if ($("#GET-username").val() == '') {
            $('#error-username').html('Error: must fill in username');
            $('#error-username').css("display", "block");
            $("#GET-username").focus()
        } else if ($("#GET-password").val() == '') {
            $('#error-password').html('Error:  must fill in password');
            $('#error-password').css("display", "block");
            $("#GET-password").focus()
        } else {
            const userData = {
                username: $("#GET-username").val(),
                password: $("#GET-password").val()
            };
            const newUserUrl = '/api/auth/login/';
            const newUserSettings = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json; charset=utf-8",
                },
                "body": JSON.stringify(userData)
            };
            genericFetch(newUserUrl, newUserSettings, cbLogin);
           
        }
    });
}



function onSignupRequestClick() {
    $(document).on('click', '#signup-btn', function(event) {
        event.preventDefault();
        $('#error-msg').remove();
        RENDER.renderRegistrationForm();
    });
}

function onLogoutClick() {
    $(document).on('click', '#header-logout', function(event) {
        event.preventDefault();
        let userName = localStorage.getItem('username');
        CACHE.deleteAuthenticatedUserFromCache();
        renderLogout(userName);
        renderLoginForm();
    });
}

function onGoHome() {
    $(document).on('click', '#header-title', function(event) {
        event.preventDefault();
        $('.options-container').css('display', 'block');
        $('.section-login').html('').css('display','none');
        $('.addnewitem-container').html('');
        $('.closet-container').html('');
        $('.section-nav').html(''); 
        renderNavLoggedIn();
        renderOptionsPage();
    });
}


// listeners for closet functions

function onViewClosetClick() {
    $('.options-container').on('click',(function(event) {
        event.preventDefault();
        let closetElement;
        closetElement = event.target.id;
        closetClick(closetElement);
}));
}

function onViewClosetFromNavMenuClick() {
    $('.section-nav').on('click','.options-btns-min',(function(event) {
        event.preventDefault();
        let closetElement;
        closetElement=event.target.id;
        closetClick(closetElement);
}));
}

function closetClick(closetElement) {
    switch (closetElement) {
        case `ideal-closet-btn`:
        case `ideal-closet-btn-min`:
                            STORE.selCloset = 'ideal';
                            break;
        case `my-closet-btn`:
        case `my-closet-btn-min`:
                            STORE.selCloset = 'my';
                            break;
        case `donation-closet-btn`:
        case `donation-closet-btn-min`:
                            STORE.selCloset = 'donation';
                            break;
        case `giveaway-closet-btn`:
        case `giveaway-closet-btn-min`:
                            STORE.selCloset = 'giveaway';
                            break;
        case `analyze-closet-btn`:
        case `analyze-closet-btn-min`:
                            STORE.selCloset = 'analyze';
                            break;
    }

    if (STORE.selCloset === 'analyze') {
        STORE.functionChoice = 'analysis';
        getAnalysis();
    } else {
        STORE.functionChoice = 'closet';
        fetchCloset(); 
    }
}

function getAnalysis() {
    const jwtToken = localStorage.getItem("jwtToken");
    const authUser = localStorage.getItem('userid');
    
    let getAnalysisUrl = '/api/idealcloset/';
    let getAnalysisSettings = {
        "method": "GET",
        "headers": {
            'Accept': 'application/json, text/plain, *',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    };
   HTTP.genericFetch(getAnalysisUrl, getAnalysisSettings, organizeData);
   
   getAnalysisUrl = `/api/userclosets/mycloset/${authUser}`;
   getAnalysisSettings = {
        "method": "GET",
        "headers": {
            'Accept': 'application/json, text/plain, *',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    };
    HTTP.genericFetch(getAnalysisUrl, getAnalysisSettings, organizeData);
}



function onAddItemToClosetClick() {
    $('.closet-container').on('click', '#cl-add-btn', (function(event){
        event.preventDefault();
        $('.options-container').html('');
        $('.closet-container').html('');
        let addMsg = "add your next item here"
        renderAddItemForm(addMsg);
    }));
}


function onUpdateItemInClosetClick() {
    $('.section-closet').on('click', '#cl-edit-btn', (function(event) {
        event.preventDefault();
        updateStoreItem(this);
        renderUpdateForm();
    }));
}

function onSaveUpdatedItemToClosetClick() {
    $('.closet-container').on('click','#cl-updatebtn-final', function(event) {
        event.preventDefault();
        console.log('made it to save updated itemitem to closet');
        const jwtToken = localStorage.getItem("jwtToken");
        const authUser = localStorage.getItem("userid");
        STORE.currentEditItem = {
            season: $("input[name='season']:checked").val(),
            appareltype:$("input[name='appareltype']:checked").val(),
            color: $("input[name='color']:checked").val(),
            shortdesc:$('#js-additem-shortdesc').val(),
            longdesc: $('#js-additem-longdesc').val(),
            size: $("input[name='size']:checked").val()
        };

       // STORE.selCloset = $(this).attr('data-closet');
        let addItemUrl = '';
        if (STORE.authUserName === 'admin') {
            addItemUrl = '/api/idealcloset/';
        } else {
            if (STORE.selCloset === 'giveaway') {
                addItemUrl = `/api/groupclosets/giveawaycloset`;
            } else {
                addItemUrl = `/api/userclosets/${STORE.selCloset}closet/${authUser}`;
            }
        };
        const addItemSettings = {
            "method": "PUT",
            "headers": {
                'Accept': 'application/json, text/plain, *',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(STORE.currentEditItem)
        };
       genericFetch(addItemUrl, addItemSettings, fetchCloset);
    
    });
}

function updateStoreItem(currentBtn) {
    STORE.currentEditItem = {
        id: $(currentBtn).attr('data-id'),
        season: $(currentBtn).attr('data-season'),
        color: $(currentBtn).attr('data-color'),
        appareltype: $(currentBtn).attr('data-appareltype'),
        shortdesc: $(currentBtn).attr('data-shortdesc'),
        longdesc: $(currentBtn).attr('data-longdesc'),
        size: $(currentBtn).attr('data-size')
    }
}

function onSaveItemToClosetClick() {
    $('.section-closet').on('click', '#js-save-btn', function(event){
        event.preventDefault();
        console.log('made it to save item to closet');
      
        const jwtToken = localStorage.getItem("jwtToken");
        const authUser = localStorage.getItem("userid");
        STORE.currentEditItem = {
            season: $("input[name='season']:checked").val(),
            appareltype:$("input[name='appareltype']:checked").val(),
            color: $("input[name='color']:checked").val(),
            shortdesc:$('#js-additem-shortdesc').val(),
            longdesc: $('#js-additem-longdesc').val(),
            size: $("input[name='size']:checked").val()
        };

        STORE.selCloset = $(this).attr('data-closet');
        let addItemUrl = '';
        if (STORE.authUserName === 'admin') {
            addItemUrl = '/api/idealcloset/';
        } else {
            if (STORE.selCloset === 'giveaway') {
                addItemUrl = `/api/groupclosets/giveawaycloset`;
            } else {
                addItemUrl = `/api/userclosets/${STORE.selCloset}closet/${authUser}`;
            }
        };
        const addItemSettings = {
            "method": "POST",
            "headers": {
                'Accept': 'application/json, text/plain, *',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(STORE.currentEditItem)
        };
        genericFetch(addItemUrl, addItemSettings, fetchCloset);
       
    });
}

function onDeleteItemInClosetClick() {
    $(document).on('click', '#cl-delete-btn', (function(event){
        event.preventDefault();
        updateStoreItem(this);
        const userSaidYes = confirm('Are you sure you want to delete this item?');
        if (userSaidYes) {
                const jwtToken = localStorage.getItem("jwtToken");
                let selectedItemId = STORE.currentEditItem.id;
                let deleteItemUrl = '';
                if (localStorage.getItem("name") === 'Admin ID') {
                    deleteItemUrl = `/api/idealcloset/${selectedId}`;
                } else {
                    deleteItemUrl = `/api/userclosets/mycloset/${STORE.authUser}/${selectedItemId}`;
                };


                //const deleteItemUrl = '/api/auth/login/';
                const deleteItemSettings = {
                    "method": "DELETE",
                    "headers": {
                        'Accept': 'application/json, text/plain, *',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`
                    }
                };
        HTTP.genericFetch(deleteItemUrl, deleteItemSettings);

        //HTTP.fetchCloset();
    }
    }));
}
/*
function onCancelAddItemClick() {
    $('.closet-container').on('click', '#cl-cancel-btn', (function(event) {
        event.preventDefault();
        HTTP.fetchCloset();
    }))
}
*/
function onPasswordRevealClick() {
    $(document).on('click', '.password-icon', (function(event) {
        event.preventDefault();
        if ($( "input[name='new-password']").attr('type') === 'password') {
            $( "input[name='new-password']").attr('type','text');
            $(this).removeClass("fa-eye-slash").addClass("fa-eye");
            
          } else {
            $( "input[name='new-password']").attr('type','password');
            $(this).removeClass("fa-eye");
            $(this).addClass("fa-eye-slash");
          };
    }));
}

function onLoginPasswordRevealClick() {
    $(document).on('click', '.password-icon', (function(event) {
        event.preventDefault();
        if ($( "input[name='GET-password']").attr('type') === 'password') {
            $( "input[name='GET-password']").attr('type','text');
            $(this).removeClass("fa-eye-slash").addClass("fa-eye");
            
          } else {
            $( "input[name='GET-password']").attr('type','password');
            $(this).removeClass("fa-eye");
            $(this).addClass("fa-eye-slash");
          };
    }));
}

function onConfirmPasswordRevealClick() {
    $(document).on('click', '.password-confirm-icon', (function(event) {
        event.preventDefault();
        if ($( "input[name='confirm-password']").attr('type') === 'password') {
            $( "input[name='confirm-password']").attr('type','text');
            $(this).removeClass("fa-eye-slash").addClass("fa-eye");
            
          } else {
            $( "input[name='confirm-password']").attr('type','password');
            $(this).removeClass("fa-eye");
            $(this).addClass("fa-eye-slash");
          };
    }));
}

function onMoveItemClick() {
    $('.section-closet').on('click', '.js-move', (function(event) {
        event.preventDefault();
        updateStoreItem(this);

        const jwtToken = localStorage.getItem("jwtToken");
        const authUser = localStorage.getItem('userid');
        let selectedItemId = STORE.currentEditItem.id;
        let currentId = $(this).attr("id");
        
        let deleteItemUrl = `/api/userclosets/mycloset/${STORE.authUser}/${selectedItemId}`;
        const deleteItemSettings = {
            "method": "DELETE",
            "headers": {
                'Accept': 'application/json, text/plain, *',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        };
       HTTP.genericFetch(deleteItemUrl, deleteItemSettings);

       let addItemUrl;
       if(currentId === 'cl-donate-btn'){
            STORE.selCloset='donation';
            addItemUrl = `/api/userclosets/${STORE.selCloset}closet/${authUser}`;
        } else {
            STORE.selCloset='giveaway';
            addItemUrl = `/api/groupclosets/giveawaycloset`;
        }

        
        const addItemSettings = {
            "method": "POST",
            "headers": {
               'Accept': 'application/json, text/plain, *',
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${jwtToken}`
            },
            "body": JSON.stringify(STORE.currentEditItem)
        };

        HTTP.genericFetch(addItemUrl, addItemSettings);
        STORE.selCloset = 'my';
        HTTP.fetchCloset();
    }));
}



    function onReturnItemClick() {
        $('.section-closet').on('click', '#cl-return-btn', (function(event) {
            event.preventDefault();
            updateStoreItem(this);
            const jwtToken = localStorage.getItem("jwtToken");
            let selectedItemId = STORE.currentEditItem.id;

            // delete item from donation closet
            let deleteItemUrl = `/api/userclosets/donationcloset/${STORE.authUser}/${selectedItemId}`;
            const deleteItemSettings = {
                "method": "DELETE",
                "headers": {
                    'Accept': 'application/json, text/plain, *',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            };
           HTTP.genericFetch(deleteItemUrl, deleteItemSettings);

           //  add item to my closet

            let addItemUrl = `/api/userclosets/mycloset/${STORE.authUser}`;
            const addItemSettings = {
                "method": "POST",
                "headers": {
                   'Accept': 'application/json, text/plain, *',
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${jwtToken}`
                },
                "body": JSON.stringify(STORE.currentEditItem)
            };
   
            HTTP.genericFetch(addItemUrl, addItemSettings);
          
        }));

        fetchCloset();
}



$(document).ready(function () {
    onPageLoad();
    onSignupRequestClick();
    onRegisterNewUserClick();
    onSigninClick();
    onLogoutClick();
    onGoHome();
    onViewClosetClick();
    onViewClosetFromNavMenuClick();
    onAddItemToClosetClick();
    onSaveItemToClosetClick();
    onDeleteItemInClosetClick();
    onUpdateItemInClosetClick();
    onSaveUpdatedItemToClosetClick()
    //onCancelAddItemClick();
    onMoveItemClick();
    onReturnItemClick();
    //onSave1();
    //onSave2();
});


