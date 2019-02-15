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
        //$('#default-menu').removeAttr('hidden');
    }
}


// ***** LISTENERS


// listeners for registration and login

function onRegisterNewUserClick() {
    $(document).on('click', '#btn-register', function(event){
        event.preventDefault();
        $('#error-msg').remove();
        const newName = $('#new-name').val();
        const newEmail = $('#new-email').val();
        const newUsername = $('#new-username').val();
        const newPassword = $("#new-password").val();
        const newPasswordConfirm = $("#confirm-password").val();
        
        if (newName === '' || newEmail === '' || newUsername === '' || newPassword === '') {
            // add current error
            $('#btn-register').before('<p class="error-msg" id="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> One of your entries is blank.</p>');
        } else if (newPassword != newPasswordConfirm) {
            // add current error
            $('#btn-register').before('<p class="error-msg" id="error-msg" aria-live="assertive"><i class="fas fa-exclamation-circle"></i> Password and Confirmation Password are not the same</p>');

        } else {
            const userData = {
                name: newName,
                email: newEmail,
                username: newUsername,
                password: newPassword
            };
            HTTP.fetchForCreateNewUser(userData);
        };
    });
}

function onSigninClick() {
    $(document).on('click', '#signin-btn', function(event) {
        event.preventDefault();
        $('#error-msg').remove();
        const userData = {
            username: $("#GET-username").val(),
            password: $("#GET-password").val()
        };
        $('.section-options').html('');
        $('.section-login').html('');
        $('.closet-container').html('');
        $('.section-nav').html('');
        HTTP.fetchForLogUserIn(userData);
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
        //return to login page
        const userName= localStorage.getItem("username");

        CACHE.deleteAuthenticatedUserFromCache();
        $('.section-options').html('');
        $('.section-login').html('');
        $('.closet-container').html('');
        $('.section-nav').html('');
        RENDER.renderLogout(userName);
        RENDER.renderLoginForm();
    });
}

function onGoHome() {
    $(document).on('click', '#header-title', function(event) {
        event.preventDefault();
        $('.section-options').html('');
        $('.section-login').html('');
        $('.closet-container').html('');
        $('.section-nav').html(''); 
        $('.closet-container').html('');
        RENDER.renderNavLoggedIn();
        RENDER.renderOptionsPage();
    });
}


// listeners for closet functions

function onViewClosetClick() {
    $('.section-options').on('click', (function(event) {
        event.preventDefault();
        let closetElement;
        console.log(event.target);
        console.log(event.target.id);
        console.log(event.target.parentElement.id);
        if (event.target.id.includes('btn') && event.target.id != "") {
            closetElement=event.target.id;
        } else {
            closetElement=event.target.parentElement.id;
        }
        let selectedClosetArr = [];
        selectedClosetArr = closetElement.split("-");
        STORE.selCloset=selectedClosetArr[0];
        if (STORE.selCloset === 'analyze') {
            STORE.functionChoice = 'analysis';
            //STORE.isAnalyze = true;
            fetchForAnalysis();
        } else {
            STORE.functionChoice = 'closet';
            HTTP.fetchCloset(); 
        }
}));
}


function onViewClosetFromNavMenuClick() {
   // $('.section-nav').on('click',(function(event) {
    $(document).on('click','.options-btns-min',(function(event) {
        event.preventDefault();
        let closetElement;
        closetElement=event.target.id;
        let closetElementArr = [];
        closetElementArr = closetElement.split("-");
        STORE.selCloset = closetElementArr[0]
        console.log('from nav ' + STORE.selCloset);
        if (STORE.selCloset === 'analyze') {
            STORE.functionChoice = 'analysis';
            HTTP.fetchForAnalysis();
        } else {
            STORE.functionChoice = 'closet';
            HTTP.fetchCloset(); 
        }
}));
}

function onAddItemToClosetClick() {
    $('.section-closet').on('click', '#cl-add-btn', (function(event){
        event.preventDefault();
        const selMsg = "";
        RENDER.renderAddItemForm(selMsg);
    }));
}

function onSaveItemToClosetClick() {
    $('.section-closet').on('click','#cl-save-btn', function(event) {
        event.preventDefault();
        console.log(event.target);
        console.log(event.currentTarget);
        console.log(event.target.id);
        const newItem= {
            season: $("input[name='season']:checked").val(),
            appareltype:$("input[name='appareltype']:checked").val(),
            color: $("input[name='color']:checked").val(),
            shortdesc:$('#js-additem-shortdesc').val(),
            longdesc: $('#js-additem-longdesc').val(),
            size: $("input[name='size']:checked").val()
        };
    
        HTTP.fetchForCreateNewItemInCloset(newItem);
    });
}

function onUpdateItemInClosetClick() {
    $('.section-closet').on('click', '#cl-edit-btn', (function(event) {
        event.preventDefault();
        let closetElement = '';
        STORE.currentEditItem = {
            id: $(this).attr('data-id'),
            season: $(this).attr('data-season'),
            color: $(this).attr('data-color'),
            appareltype: $(this).attr('data-appareltype'),
            shortdesc: $(this).attr('data-shortdesc'),
            longdesc: $(this).attr('data-longdesc'),
            size: $(this).attr('data-size')
        }
        console.log(STORE.currentEditItem);
        RENDER.renderUpdateForm();
    }));
}

function onFinalUpdateItemInClosetClick() {
    $('.section-closet').on('click', '#cl-updatebtn-final', function(event){
        event.preventDefault();
        STORE.currentEditItem = {
            id: $(this).attr('data-id'),
            season: $("#js-updateseason").val(),
            color: $("#js-updatecolor").val(),
            appareltype: $("#js-updateappareltype").val(),
            shortdesc: $("#js-updateshortdesc").val(),
            longdesc: $("#js-updatelongdesc").val(),
            size: $("#js-updatesize").val()
        };
        HTTP.fetchForUpdateClosetItemData();
    });
}

function onDeleteItemInClosetClick() {
    $(document).on('click', '#cl-delete-btn', (function(event){
        event.preventDefault();
        const selItemId = $(this).attr('data-id');
        // Step 2: Verify use is sure of deletion
        const userSaidYes = confirm('Are you sure you want to delete this item?');
        if (userSaidYes) {
            // step 3:  make fetch call to delete item from closet
            HTTP.fetchForDeleteClosetItemData(selItemId);
        }
    }));
}


function onCancelAddItemClick() {
    $(document).on('click', '#cl-cancel-btn', (function(event) {
        event.preventDefault();
        console.log()
        HTTP.fetchCloset();
    }))
}

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

function onDonateItemClick() {
    $('.section-closet').on('click', '#cl-donate-btn', (function(event) {
        event.preventDefault();
        STORE.currentEditItem = {
            id: $(this).attr('data-id'),
            season: $(this).attr('data-season'),
            color: $(this).attr('data-color'),
            appareltype: $(this).attr('data-appareltype'),
            shortdesc: $(this).attr('data-shortdesc'),
            longdesc: $(this).attr('data-longdesc'),
            size: $(this).attr('data-size')
        };
        console.log('leaving onDonationItemClick ', STORE.currentEditItem.id);
        HTTP.fetchForDonation();
      
    }));
}

function onGiveawayItemClick() {
    $('.section-closet').on('click', '#cl-giveaway-btn', (function(event) {
        event.preventDefault();
        console.log('giveaway button has been clicked');
        STORE.currentEditItem = {
            id: $(this).attr('data-id'),
            season: $(this).attr('data-season'),
            color: $(this).attr('data-color'),
            appareltype: $(this).attr('data-appareltype'),
            shortdesc: $(this).attr('data-shortdesc'),
            longdesc: $(this).attr('data-longdesc'),
            size: $(this).attr('data-size')
        };
        console.log('leaving onGiveawayItemClick ', STORE.currentEditItem.id);
        HTTP.fetchForGiveaway();
      
    }));
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
    onSaveItemToClosetClick()
    onDeleteItemInClosetClick();
    onUpdateItemInClosetClick();
    onFinalUpdateItemInClosetClick();
    onCancelAddItemClick();
    onDonateItemClick();
    onGiveawayItemClick();
});


