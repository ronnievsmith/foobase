/*
Created by Ron Royston, https://rack.pub
https://github.com/rhroyston/freebase
License: MIT 2018
*/

(function() {
    var doc = document;
    
    // Google Firebase /////////////////////////////////////////////////////////////
    var getArg = getArg();
    var config = {
        apiKey: "AIzaSyBw2_TQE1VwfB5ARc1l76tMN4l-1Vza5xU",
        authDomain: "freebase-72f7d.firebaseapp.com",
        databaseURL: "https://freebase-72f7d.firebaseio.com",
        projectId: "freebase-72f7d",
        storageBucket: "freebase-72f7d.appspot.com",
        messagingSenderId: "303732345942"
    };
    var firebase = window.firebase;
    var mode = getArg['mode'];
    var oobCode = getArg['oobCode'];
    var providers = doc.getElementsByClassName('provider');
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (doc.getElementById("sign-in-button")) {
                doc.getElementById("sign-in-button").classList.add("hidden");
            }
            if (doc.getElementById("account-section-image")){
                returnPhotoURL().then(function(value){
                    doc.getElementById("account-section-image").style.backgroundImage = "url('" + value + "')";
                });
                doc.getElementById("account-section-image").classList.remove("hidden");                
            }
            switch (user.providerData[0].providerId) {
                case 'facebook':
                case 'github':
                case 'google':
                case 'twitter':
                    break;
                case 'password':
                    // if (!verifiedUser) {
                    // }
                    break;
            }
        }
        else { //USER IS NOT SIGNED IN
            //show login button
            if (doc.getElementById("sign-in-button")) {
                doc.getElementById("sign-in-button").classList.remove("hidden");
            }
            if (doc.getElementById("account-section-image")) {
                //hide account photo
                doc.getElementById("account-section-image").classList.add("hidden");                
            }
            //dialogReset();
        }
        processAccess();
    });
    switch (mode) {
        case 'resetPassword':
            handleResetPassword(oobCode);
            break;
        case 'recoverEmail':
            handleRecoverEmail(oobCode);
            break;
        case 'verifyEmail':
            handleVerifyEmail(oobCode);
            break;
    }
    function authAction(provider) {
        firebase.auth().signInWithPopup(provider).then(function(result) {
            dialog.close();
            var docRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
            var o = {};
            docRef.get().then(function(thisDoc) {
                if (thisDoc.exists) {
                    //user is already there, write only last login
                    o.lastLoginDate = Date.now();
                    docRef.update(o);
                } else {
                    //new user
                    o.displayName = firebase.auth().currentUser.displayName;
                    o.accountCreatedDate = Date.now();
                    o.lastLoginDate = Date.now();
                    // Send it
                    docRef.set(o);
                }
                toast(firebase.auth().currentUser.displayName + " is in.");
            }).catch(function(error) {
                toast(error.message);
            });
        }).catch(function(error) {
            toast(error.message);
        });
    }
    function deleteAccount() {
        firebase.auth().currentUser.delete().then(function(value) {
            toast('Account Deleted');
        }).catch(function(error) {
            toast(error.message);
        });
    }
    function fireAuth() {
        var provider;
        switch (this.id) {
            case 'email':
                resetDialogSections();
                doc.getElementById("dialog-label").innerHTML = "Account - Email Sign In";
                doc.getElementById("dialog-accept-button").classList.remove("hidden");
                doc.getElementById("dialog-accept-button").disabled = true;
                doc.getElementById("email-signin-section").classList.remove("hidden");
                doc.getElementById("email-signin-section").classList.add("active");
                // initialize textFields
                //mdc.textField.MDCTextField.attachTo(doc.querySelector('.mdc-text-field'));
                //mdc.textfield.MDCTextfield.attachTo(doc.getElementById("username").parentElement);
                //mdc.textField.MDCTextField.attachTo(document.querySelector('#username'));
                //mdc.textField.MDCTextField.attachTo(document.querySelector('#password'));
                //mdc.textfield.MDCTextfield.attachTo(doc.getElementById("password").parentElement);
                return;
            case 'facebook':
                provider = new firebase.auth.FacebookAuthProvider();
                break;
            case 'github': 
                provider = new firebase.auth.GithubAuthProvider();
                break;
            case 'google':
                provider = new firebase.auth.GoogleAuthProvider();
                break;
            case 'twitter':
                provider = new firebase.auth.TwitterAuthProvider();
                break;
        }
        authAction(provider);
    }
    function firePseudoAnchor() {
        switch (this.id) {
            case 'password-reset':
                resetDialogSections();
                doc.getElementById("dialog-label").innerHTML = "Send Password Reset Link";
                doc.getElementById("email-reset-section").classList.add("active");
                doc.getElementById("email-reset-section").classList.remove("hidden");
                break;
            case 'register':
                resetDialogSections();
                doc.getElementById("dialog-label").innerHTML = "Register An Email Address";
                doc.getElementById("registration").classList.add("active");
                doc.getElementById("registration").classList.remove("hidden");
                break;
        }
        //anything under here fires no matter what without return
    } 
    function getArg(param) {
        var vars = {};
        window.location.href.replace(location.hash, '').replace(
            /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
            function(m, key, value) { // callback
                vars[key] = value !== undefined ? value : '';
            }
        );
        if (param) {
            return vars[param] ? vars[param] : null;
        }
        return vars;
    }
    function getGravatar(email, size) {
        // MD5 (Message-Digest Algorithm) by WebToolkit
        var MD5 = function(s) {
            function L(k, d) {
                return (k << d) | (k >>> (32 - d))
            }

            function K(G, k) {
                var I, d, F, H, x;
                F = (G & 2147483648);
                H = (k & 2147483648);
                I = (G & 1073741824);
                d = (k & 1073741824);
                x = (G & 1073741823) + (k & 1073741823);
                if (I & d) {
                    return (x ^ 2147483648 ^ F ^ H)
                }
                if (I | d) {
                    if (x & 1073741824) {
                        return (x ^ 3221225472 ^ F ^ H)
                    }
                    else {
                        return (x ^ 1073741824 ^ F ^ H)
                    }
                }
                else {
                    return (x ^ F ^ H)
                }
            }

            function r(d, F, k) {
                return (d & F) | ((~d) & k)
            }

            function q(d, F, k) {
                return (d & k) | (F & (~k))
            }

            function p(d, F, k) {
                return (d ^ F ^ k)
            }

            function n(d, F, k) {
                return (F ^ (d | (~k)))
            }

            function u(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(r(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function f(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(q(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function D(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(p(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function t(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(n(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function e(G) {
                var Z;
                var F = G.length;
                var x = F + 8;
                var k = (x - (x % 64)) / 64;
                var I = (k + 1) * 16;
                var aa = Array(I - 1);
                var d = 0;
                var H = 0;
                while (H < F) {
                    Z = (H - (H % 4)) / 4;
                    d = (H % 4) * 8;
                    aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
                    H++
                }
                Z = (H - (H % 4)) / 4;
                d = (H % 4) * 8;
                aa[Z] = aa[Z] | (128 << d);
                aa[I - 2] = F << 3;
                aa[I - 1] = F >>> 29;
                return aa
            }

            function B(x) {
                var k = "",
                    F = "",
                    G, d;
                for (d = 0; d <= 3; d++) {
                    G = (x >>> (d * 8)) & 255;
                    F = "0" + G.toString(16);
                    k = k + F.substr(F.length - 2, 2)
                }
                return k
            }

            function J(k) {
                k = k.replace(/rn/g, "n");
                var d = "";
                for (var F = 0; F < k.length; F++) {
                    var x = k.charCodeAt(F);
                    if (x < 128) {
                        d += String.fromCharCode(x)
                    }
                    else {
                        if ((x > 127) && (x < 2048)) {
                            d += String.fromCharCode((x >> 6) | 192);
                            d += String.fromCharCode((x & 63) | 128)
                        }
                        else {
                            d += String.fromCharCode((x >> 12) | 224);
                            d += String.fromCharCode(((x >> 6) & 63) | 128);
                            d += String.fromCharCode((x & 63) | 128)
                        }
                    }
                }
                return d
            }
            var C = Array();
            var P, h, E, v, g, Y, X, W, V;
            var S = 7,
                Q = 12,
                N = 17,
                M = 22;
            var A = 5,
                z = 9,
                y = 14,
                w = 20;
            var o = 4,
                m = 11,
                l = 16,
                j = 23;
            var U = 6,
                T = 10,
                R = 15,
                O = 21;
            s = J(s);
            C = e(s);
            Y = 1732584193;
            X = 4023233417;
            W = 2562383102;
            V = 271733878;
            for (P = 0; P < C.length; P += 16) {
                h = Y;
                E = X;
                v = W;
                g = V;
                Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
                V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
                W = u(W, V, Y, X, C[P + 2], N, 606105819);
                X = u(X, W, V, Y, C[P + 3], M, 3250441966);
                Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
                V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
                W = u(W, V, Y, X, C[P + 6], N, 2821735955);
                X = u(X, W, V, Y, C[P + 7], M, 4249261313);
                Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
                V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
                W = u(W, V, Y, X, C[P + 10], N, 4294925233);
                X = u(X, W, V, Y, C[P + 11], M, 2304563134);
                Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
                V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
                W = u(W, V, Y, X, C[P + 14], N, 2792965006);
                X = u(X, W, V, Y, C[P + 15], M, 1236535329);
                Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
                V = f(V, Y, X, W, C[P + 6], z, 3225465664);
                W = f(W, V, Y, X, C[P + 11], y, 643717713);
                X = f(X, W, V, Y, C[P + 0], w, 3921069994);
                Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
                V = f(V, Y, X, W, C[P + 10], z, 38016083);
                W = f(W, V, Y, X, C[P + 15], y, 3634488961);
                X = f(X, W, V, Y, C[P + 4], w, 3889429448);
                Y = f(Y, X, W, V, C[P + 9], A, 568446438);
                V = f(V, Y, X, W, C[P + 14], z, 3275163606);
                W = f(W, V, Y, X, C[P + 3], y, 4107603335);
                X = f(X, W, V, Y, C[P + 8], w, 1163531501);
                Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
                V = f(V, Y, X, W, C[P + 2], z, 4243563512);
                W = f(W, V, Y, X, C[P + 7], y, 1735328473);
                X = f(X, W, V, Y, C[P + 12], w, 2368359562);
                Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
                V = D(V, Y, X, W, C[P + 8], m, 2272392833);
                W = D(W, V, Y, X, C[P + 11], l, 1839030562);
                X = D(X, W, V, Y, C[P + 14], j, 4259657740);
                Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
                V = D(V, Y, X, W, C[P + 4], m, 1272893353);
                W = D(W, V, Y, X, C[P + 7], l, 4139469664);
                X = D(X, W, V, Y, C[P + 10], j, 3200236656);
                Y = D(Y, X, W, V, C[P + 13], o, 681279174);
                V = D(V, Y, X, W, C[P + 0], m, 3936430074);
                W = D(W, V, Y, X, C[P + 3], l, 3572445317);
                X = D(X, W, V, Y, C[P + 6], j, 76029189);
                Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
                V = D(V, Y, X, W, C[P + 12], m, 3873151461);
                W = D(W, V, Y, X, C[P + 15], l, 530742520);
                X = D(X, W, V, Y, C[P + 2], j, 3299628645);
                Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
                V = t(V, Y, X, W, C[P + 7], T, 1126891415);
                W = t(W, V, Y, X, C[P + 14], R, 2878612391);
                X = t(X, W, V, Y, C[P + 5], O, 4237533241);
                Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
                V = t(V, Y, X, W, C[P + 3], T, 2399980690);
                W = t(W, V, Y, X, C[P + 10], R, 4293915773);
                X = t(X, W, V, Y, C[P + 1], O, 2240044497);
                Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
                V = t(V, Y, X, W, C[P + 15], T, 4264355552);
                W = t(W, V, Y, X, C[P + 6], R, 2734768916);
                X = t(X, W, V, Y, C[P + 13], O, 1309151649);
                Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
                V = t(V, Y, X, W, C[P + 11], T, 3174756917);
                W = t(W, V, Y, X, C[P + 2], R, 718787259);
                X = t(X, W, V, Y, C[P + 9], O, 3951481745);
                Y = K(Y, h);
                X = K(X, E);
                W = K(W, v);
                V = K(V, g)
            }
            var i = B(Y) + B(X) + B(W) + B(V);
            return i.toLowerCase()
        };
        var size = size || 80;
        return 'https://www.gravatar.com/avatar/' + MD5(email) + '.jpg?s=' + size;
    }
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var file = evt.target.files[0];
        var metadata = {
            'contentType': file.type
        };
        // Push to child path.
        // Upload file and metadata to the object 'images/mountains.jpg'
        var uploadTask;
        var target = firebase.storage().ref().child('images/');
        switch (evt.target.id) {
            case "admin-image-input-file":
                uploadTask = target.child(file.name).put(file, metadata);
            break;
        }
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        },
        function(error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    console.log(error.code);
                    break;
                    
                case 'storage/canceled':
                    // User canceled the upload
                    console.log(error.code);
                    break;
                    
                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    console.log(error.code);
                    break;
            }
        },
        function() {
            // Upload completed successfully, now we can get the download URL
            var downloadURL = uploadTask.snapshot.downloadURL;
            evt.target.parentElement.firstElementChild.blur();
            switch (evt.target.id) {
                case "admin-image-input-file":
                    doc.getElementById("admin-image-input").value = downloadURL;
                    doc.getElementById("admin-image-input").parentElement.classList.add("mdc-text-field--upgraded");
                    doc.getElementById("admin-image-input").nextElementSibling.classList.add("mdc-text-field__label--float-above");
                break;
            }
        });
    }
    function handleResetPassword(oobCode) {
        // Verify the password reset code is valid.
        firebase.auth().verifyPasswordResetCode(oobCode).then(function(email) {
            //verified that user asked for password reset now let's take their new password
            resetDialogSections();
            doc.getElementById("dialog-label").innerHTML = "Enter New Password";
            doc.getElementById("dialog-accept-button").disabled = true;
            doc.getElementById("password-reset-section").classList.remove("hidden");
            doc.getElementById("password-reset-section").classList.add("active");
            dialog.show();
            //enable email submit button
            doc.getElementById("verify-new-email-input").addEventListener("input", function() {
                if (this != null) {
                    doc.getElementById("dialog-accept-button").disabled = false;
                }
            });
            //enable pressing enter
            doc.getElementById("verify-new-email-input").addEventListener("keyup", function(e) {
                e.preventDefault();
                if (e.keyCode == 13) {
                    dialogSubmitButton.click();
                }
            });
        }).catch(function(error) {
            toast(error.message);
            console.log(error.message);
        });
    }
    function handleRecoverEmail(oobCode) {
        var restoredEmail = null;
        // Confirm the action code is valid.
        firebase.auth().checkActionCode(oobCode).then(function(info) {
            // Get the restored email address.
            restoredEmail = info['data']['email'];
            // Revert to the old email.
            return firebase.auth().applyActionCode(oobCode);
        }).then(function() {
            toast('Account email change undone');
            firebase.auth().sendPasswordResetEmail(restoredEmail).then(function() {
                // Password reset confirmation sent. Ask user to check their email.
            }).catch(function(error) {
                // Error encountered while sending password reset code.
                pub.toast(error.message);
            });
        }).catch(function(error) {
            // Invalid code.
            toast(error.message);
        });
    }
    function handleVerifyEmail(oobCode) {
        // Try to apply the email verification code.
        firebase.auth().applyActionCode(oobCode).then(function(resp) {
            toast('Email address has been verified');
            //need to clean the location url bar
            window.history.replaceState(null, null, window.location.pathname);
        }).catch(function(error) {
            // Code is invalid or expired. Ask the user to verify their email address again.
            toast(error.message);
        });
    }
    function newPasswordViaEmailReset(email) {
        firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email).then(function(value) {
            toast('Check email to complete action');
        }).catch(function(error) {
            toast(error.message);
        });
    }
    function redirect(path) {
        var baseURL = window.location.protocol + '//' + window.location.host;
        var hasSlash = path.charAt(0) == '/';
        if (!hasSlash) {
            path = '/' + path;
        }
        var onThisPage = (window.location.href.indexOf(baseURL + path) > -1);
        if (!onThisPage) {
            //redirect them to login page for message
            location = baseURL + path;
        }
    }
    function registerPasswordUser(email, displayName, password, photoURL) {
        //var user = null;
        //NULLIFY EMPTY ARGUMENTS
        for (var i = 0; i < arguments.length; i++) {
            arguments[i] = arguments[i] ? arguments[i] : null;
        }
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function() {
                firebase.auth().currentUser.sendEmailVerification();
            })
            .then(function() {
                toast('Validation link was sent to ' + email + '.');
                firebase.auth().currentUser.updateProfile({
                    displayName: displayName,
                    photoURL: photoURL
                });
            })
            .catch(function(error) {
                toast(error.message);
                console.log(error.message);
            });
    }
    function returnPhotoURL(){
        return new Promise(function(resolve, reject){
            var img = new Image();
            //if the user does not have a photoURL let's try and get one from gravatar
            if (!firebase.auth().currentUser.photoURL) {
                //first we have to see if user han an email
                if(firebase.auth().currentUser.email){
                    //set sign-in-button background image to gravatar url
                    img.addEventListener('load', function() {
                        resolve (getGravatar(firebase.auth().currentUser.email, 48));
                    }, false);
                    img.addEventListener('error', function() {
                        resolve ('//rack.pub/media/fallback-avatar.jpg');
                    }, false);            
                    img.src = getGravatar(firebase.auth().currentUser.email, 48);
                } else {
                    resolve ('//rack.pub/media/fallback-avatar.jpg');
                }
            } else {
                img.addEventListener('load', function() {
                    resolve (firebase.auth().currentUser.photoURL);
                }, false);
                img.addEventListener('error', function() {
                    resolve ('https://rack.pub/media/fallback-avatar.jpg');
                }, false);      
                img.src = firebase.auth().currentUser.photoURL;
            }
        });
    }
    function signout() {
        firebase.auth().signOut().then(function() {
            toast('Signed Out');
            redirect('/');
            clearMainSections();
            showHomeSection();          
        }, function(error) {
            toast('Sign out Failed');
        });
    };
    function verifyPassword(oobCode, newPassword, email) {
        firebase.auth().confirmPasswordReset(oobCode, newPassword).then(function(resp) {
            // Password reset has been confirmed and new password updated.
            // TODO: Display a link back to the app, or sign-in the user directly
            // if the page belongs to the same domain as the app:
            firebase.auth().signInWithEmailAndPassword(email, newPassword);
            //setAccountChip();
            toast('Password Changed');
        }).catch(function(error) {
            // Error occurred during confirmation. The code might have expired or the
            // password is too weak.
            toast(error.message);
        });
    }
    
    // Google MDC-Web UI Library ///////////////////////////////////////////////////
    var mdc = window.mdc;
    window.mdc.autoInit();
    var panels = doc.querySelector('#profile-panels');
    var adminPanels = doc.querySelector('#admin-panels');
    var adminTabBar;
    var profileTabBar;
    var pseudoAnchors = doc.querySelectorAll('.pseudo-anchor');
    if(doc.getElementById("account-menu")){
        var accountMenu = new mdc.menu.MDCSimpleMenu(doc.getElementById("account-menu"));
    }
    if(doc.getElementById("dialog-element")){
        var dialog = new mdc.dialog.MDCDialog(doc.getElementById("dialog-element"));
        //var dialog = doc.getElementById("dialog-element");
        //var dialog = window.dialog;
        dialog.listen('MDCDialog:accept', function() {
            //we need to figure out which section is open
            try {
                switch (getActiveDialogSection()) {
                    case 'email-signin-section':
                        firebase.auth().signInWithEmailAndPassword(doc.getElementById("username").value, doc.getElementById("password").value).then(function(value) {
                            //Success. Email User logged in.
                            //dialog.close();
                            var docRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
                            var o = {};
                            docRef.get().then(function(thisDoc) {
                                if (thisDoc.exists) {
                                    //user is already there, write only last login
                                    o.lastLoginDate = Date.now();
                                    docRef.update(o);
                                } else {
                                    //new user
                                    o.displayName = firebase.auth().currentUser.displayName;
                                    o.accountCreatedDate = Date.now();
                                    o.lastLoginDate = Date.now();
                                    // Send it
                                    docRef.set(o);
                                }
                                toast(firebase.auth().currentUser.displayName + " is in.");
                            });
                        }).catch(function(error) {
                            toast(error.message);
                        });                    
                        break;
                    case 'registration':
                        var email = doc.getElementById("email-input").value;
                        var displayName = doc.getElementById("display-name-input").value;
                        var password = doc.getElementById("password-input").value;
                        registerPasswordUser(email, displayName, password, "");
                        dialog.close();
                        break;
                    case 'email-reset-section':
                        break;
                    case 'password-reset-section':
                        verifyPassword(oobCode, doc.getElementById("verify-new-email-input").value, firebase.auth().currentUser.email);
                        break;
                }
            }
            catch (e) {
                toast(e);
            }
        });
        dialog.listen('MDCDialog:cancel', function() {
            resetDialogSections();
        });
    }
    if(doc.querySelector('#admin-tab-bar')){
        adminTabBar = window.adminTabBar = new mdc.tabs.MDCTabBar(document.querySelector('#admin-tab-bar'));
        adminTabBar.tabs.forEach(function(tab) {
            tab.preventDefaultOnClick = true;
        });
        adminTabBar.listen('MDCTabBar:change', function({ detail: tabs }) {
            var nthChildIndex = tabs.activeTabIndex;
            updatePanel(nthChildIndex);
        });
        function updatePanel(index) {
            var activePanel = adminPanels.querySelector('.panel.active');
            if (activePanel) {
                activePanel.classList.remove('active');
            }
            var newActivePanel = adminPanels.querySelector('.panel:nth-child(' + (index + 1) + ')');
            if (newActivePanel) {
                newActivePanel.classList.add('active');
            }
        }        
    }
    if(doc.querySelector('.mdc-snackbar')){
        var snackbar = new mdc.snackbar.MDCSnackbar(doc.querySelector('.mdc-snackbar'));
    }
    if(doc.querySelector('#profile-tab-bar')){
        profileTabBar = window.profileTabBar = new mdc.tabs.MDCTabBar(document.querySelector('#profile-tab-bar'));
        profileTabBar.tabs.forEach(function(tab) {
            tab.preventDefaultOnClick = true;
        });
        profileTabBar.listen('MDCTabBar:change', function({ detail: tabs }) {
            var nthChildIndex = tabs.activeTabIndex;
            updatePanel(nthChildIndex);
        });
        function updatePanel(index) {
            var activePanel = panels.querySelector('.panel.active');
            if (activePanel) {
                activePanel.classList.remove('active');
            }
            var newActivePanel = panels.querySelector('.panel:nth-child(' + (index + 1) + ')');
            if (newActivePanel) {
                newActivePanel.classList.add('active');
            }
        }        
    }
    function toast(msg) {
        //hack fix. Toast was sticking. This timer fixed it.
        setTimeout(function() {
            msg = String(msg);
            
            snackbar.show({
                message: msg,
                actionText: 'Close',
                actionHandler: function () {
                }
            });
        }, 500);
    };
    
    //DOM Scripting ////////////////////////////////////////////////////////////////
    var section = getArg['section'];
    var adminNavAnchors = doc.getElementsByClassName("admin-nav-anchor");
    var inputMaskers = doc.getElementsByClassName("input-masker");
    var adminSubmitButton = doc.getElementById("admin-submit-button");
    var navAnchors = doc.getElementsByClassName("nav-span");
    adminSubmitButton.addEventListener("click", function(evt){
        switch(evt.target.parentElement.parentElement.querySelector(".active").id) {
            
            case "admin-profile-panel-1":
                //set quote to firestore, get textarea and push it to /quotes/
                //window.mdc.autoInit();
                firebase.firestore().collection("quotes").add({
                    quote: doc.getElementById("admin-quotes-textarea").value,
                    stored: Date.now()
                })
                .then(function(docRef) {
                    toast("Quote Saved");
                })
                .catch(function(error) {
                    toast("Error adding quote in firestore: ", error);
                });
                
            break;
            case "admin-profile-panel-2":
                //set image to firestore at /images //admin-image-input
                firebase.firestore().collection("images").add({
                    image: doc.getElementById("admin-image-input").value,
                    stored: Date.now()
                })
                .then(function(docRef) {
                    toast("Image saved");
                })
                .catch(function(error) {
                    toast("Error adding image in firestore: ", error);
                });
            break;
            case "admin-profile-panel-3":

            break;
        }
    });    
    for (var i = 0; i < pseudoAnchors.length; i++) {
        pseudoAnchors[i].addEventListener("click", firePseudoAnchor);
    }
    
    //On initial Page Load
    attachClickListenerToNavAnchors();
    attachKeyupListenerToInputElements();
    clearMainSections();
    showHomeSection();

    if(doc.getElementById("account-menu")){
        doc.getElementById("account-menu").addEventListener('MDCSimpleMenu:selected', function(evt) {
            var choice = evt.detail.item.textContent.trim();
            try {
                if(choice === "Profile"){
                    clearMainSections();
                    doc.getElementById("profile").classList.remove("hidden");
                    profileTabBar.layout();
                    returnPhotoURL().then(function(value){
                        doc.querySelector("#profile-panel-1 > section > figure > img").setAttribute("src", value);
                    });
                    doc.querySelector("#profile-panel-1 > section > figure > img").setAttribute("alt", firebase.auth().currentUser.displayName);
                    doc.querySelector("#profile-panel-1 > section > figure > figcaption").innerHTML = firebase.auth().currentUser.displayName;
                    
                    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then(function(ref) {
                        if (ref.exists) {
                            doc.querySelector("#profile-panel-2 > section > span").innerHTML = new Date(ref.data().lastLoginDate).toLocaleDateString();
                            var newDisplayNameInput = doc.getElementById("new-display-name-input");
                            var newEmailInput = doc.getElementById("new-email-input");
                            newDisplayNameInput.value = firebase.auth().currentUser.displayName;
                            newEmailInput.value = firebase.auth().currentUser.email;
                            
                            var newDisplayNameInputParent = newDisplayNameInput.parentElement;
                            var newEmailInputParent = newEmailInput.parentElement;
                            
                            mdc.textField.MDCTextField.attachTo(doc.querySelector('.mdc-text-field'));
                            
                            newDisplayNameInput.parentElement.classList.add("mdc-text-field--upgraded");
                            newDisplayNameInput.nextElementSibling.classList.add("mdc-text-field__label--float-above");
                            
                            newEmailInput.parentElement.classList.add("mdc-text-field--upgraded");
                            newEmailInput.nextElementSibling.classList.add("mdc-text-field__label--float-above"); 
                            
                            if(firebase.auth().currentUser.providerData[0].providerId === "password"){
                                newDisplayNameInput.disabled = false;
                                newEmailInput.disabled = false;
                                newDisplayNameInput.parentElement.classList.remove("mdc-text-field--disabled");
                                newEmailInput.parentElement.classList.remove("mdc-text-field--disabled");
                                doc.getElementById("change-password-button").disabled = false;
                                doc.getElementById("edit-profile-button").disabled = false;
                            } else {
                                newDisplayNameInput.disabled = true;
                                newEmailInput.disabled = true;
                                newDisplayNameInput.parentElement.classList.add("mdc-text-field--disabled");
                                newEmailInput.parentElement.classList.add("mdc-text-field--disabled");
                                doc.getElementById("change-password-button").disabled = true;
                                doc.getElementById("edit-profile-button").disabled = true;
                            }
                        } else {
                            doc.querySelector("#profile-panel-2 > section > span").innerHTML = "not found";
                        }
                    }).catch(function(error) {
                        console.log("Error getting document:", error);
                    });
                }
                if(choice === "Sign Out"){
                    signout();
                }
            }
            catch (e) {
                toast(e);
            }        
        });
    }
    if(doc.getElementById("account-section-image")){
        doc.getElementById("account-section-image").addEventListener("click", function(evt){
            accountMenu.open = !accountMenu.open;
        }, false);
    }
    if(doc.getElementById("change-password-button")){
        doc.getElementById("change-password-button").addEventListener("click", function(evt){
            newPasswordViaEmailReset(firebase.auth().currentUser.email);
        });
    }
    if(doc.getElementById("edit-profile-button")){
        doc.getElementById("edit-profile-button").addEventListener("click", function(evt){
            var newDisplayName = doc.getElementById("dialog-new-display-name-input").value;
            var newEmail = doc.getElementById("new-email-input").value;
            
            //if display name input is different than currentUser.displayName we need to update it
            if(newDisplayName !== firebase.auth().currentUser.displayName){
                //update Firebase Auth Subsystem
                firebase.auth().currentUser.updateProfile({
                    displayName: newDisplayName
                }).then(function() {
                    //done
                }, function(error) {
                    console.log(error.message);
                });
                //update Firestore
                firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                    displayName: newDisplayName
                })
                .then(function() {
                    toast("All set " + newDisplayName);
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });            
            }
            
            //if email input is different from currentUser.email we need to update it
            if(newEmail !== firebase.auth().currentUser.email){
                firebase.auth().currentUser.updateEmail(newEmail).then(function(value) {
                    firebase.auth().currentUser.sendEmailVerification().then(function(value) {
                        toast('Check ' + firebase.auth().currentUser.email + ' to validate change.');
                        signout();
                    });
                }).catch(function(error) {
                    toast(error.message);
                });
            }
        });
    }
    if(doc.getElementById("sign-in-button")){
        doc.getElementById("sign-in-button").addEventListener("click", function(evt){
            resetDialogSections();
            doc.getElementById("dialog-label").innerHTML = "Choose Sign In Method";
            doc.getElementById("dialog-accept-button").classList.add("hidden");
            doc.getElementById("oauth-providers-signin-section").classList.add("active");
            doc.getElementById("oauth-providers-signin-section").classList.remove("hidden");
            
            dialog.lastFocusedTarget = evt.target;
            dialog.show(); 
        });
    }
    if(inputMaskers.length > 0){
        for (var i = 0; i < inputMaskers.length; i++) {
            inputMaskers[i].addEventListener("click", inputMaskHandler);
            inputMaskers[i].nextElementSibling.addEventListener("change", handleFileSelect, false);
        }
    }
    if(providers){
        for (var i = 0; i < providers.length; i++) {
            providers[i].addEventListener("click", fireAuth);
        }
    }
    if(section){
        unboldNavAnchors();
        for (var i = 0; i < navAnchors.length; i++) {
            if (navAnchors[i].dataset.link === section){
                navAnchors[i].classList.add("bold");
            }
        }
        clearMainSections();
        sectionHandler(section);
    }
    function applyAdminView(){
        for (var i = 0; i < adminNavAnchors.length; i++) {
            adminNavAnchors[i].classList.remove("hidden");
        }
    }
    function attachClickListenerToNavAnchors(){
        var navLinks = doc.querySelectorAll("body > nav > section > .nav-span");
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener("click", clickHandler);
        }
        function clickHandler() {
            var section = this.dataset.link;
            unboldNavAnchors();
            this.classList.add("bold");
            clearMainSections();
            
            if(section === "/"){
                showHomeSection();
                window.history.pushState(null, null, section);
                
            } else {
                window.history.pushState(null, null, "?section=" + section.toLowerCase());
            }
            sectionHandler(section);
        }
    }
    function sectionHandler(section){
        switch (section){
            case ("/"):
                showHomeSection();
            break;
            case ("admin"):
                isAdmin().then(function(res){
                    if (res === true) {
                        doc.getElementById("admin-section").classList.remove("hidden");
                        adminTabBar.layout();
                    } else {
                        window.location.href = '/';
                    }
                });
            break;
            case ("apps"):
                doc.getElementById("apps-section").classList.remove("hidden");
            break;
            case ("images"):
                doc.getElementById("images-section").innerHTML = "";
                doc.getElementById("images-section").classList.remove("hidden");
                dropImages();
            break;
            case ("quotes"):
                doc.getElementById("quotes-section").innerHTML = "";
                doc.getElementById("quotes-section").classList.remove("hidden");
                dropQuotes();
            break;
        }
    }
    function attachKeyupListenerToInputElements(){
        var inputs = doc.querySelectorAll('input');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener("keyup", keyupHandler);
        }
        
        function keyupHandler() {
            if(this.value === ''){
                this.setCustomValidity('Required Field');
            } else {
                this.setCustomValidity('');
            }
            //for dialog inputs
            if(doc.querySelector(".mdc-dialog").classList.contains("mdc-dialog--open")){
                //dialog is open
                var thisSection  = this.parentElement.parentElement;
                var theseInputs = thisSection.querySelectorAll("input");
                var inputsFull = true;
                for (var i = 0; i < theseInputs.length; i++) {
                    if(!theseInputs[i].checkValidity()){
                        inputsFull = false;
                    }
                }
                if(inputsFull){
                    doc.getElementById("dialog-accept-button").disabled = false;
                }
            }
        }
    }    
    function clearMainSections(){
        var mainBodySections = doc.querySelectorAll("main > section");
        for (var i = 0; i < mainBodySections.length; i++) {
            mainBodySections[i].classList.add("hidden");
            //mainBodySections[i].style.display = "none";
        }
    }

    function dropQuotes(){
        firebase.firestore().collection("quotes").get().then(function(querySnapshot) {
            //var thisImgElement;
            //var thisTime;
            querySnapshot.forEach(function(snap) {
                if(snap.data().quote){
                    //thisTime = snap.data().stored;
                    var quoteDiv = doc.createElement("div");
                    quoteDiv.classList.add("quote-div");
                    //quoteDiv.style.backgroundImage = "url(" + snap.data().image + ")";
                    var quoteSpan = doc.createElement("span");
                    quoteSpan.classList.add("flex-item","quote-span");
                    quoteSpan.innerHTML = snap.data().quote;
                    quoteDiv.appendChild(quoteSpan);
                    doc.getElementById("quotes-section").appendChild(quoteDiv);    
                }
            });
        });  
    }
    function dropImages(){
        firebase.firestore().collection("images").get().then(function(querySnapshot) {
            //var thisImgElement;
            var thisTime;
            querySnapshot.forEach(function(snap) {
                thisTime = snap.data().stored;
                var imageCardDiv = doc.createElement("div");
                imageCardDiv.classList.add("mdc-card","image-card");
                imageCardDiv.style.backgroundImage = "url(" + snap.data().image + ")";
                var imageCardText = doc.createElement("section");
                imageCardText.classList.add("mdc-card__supporting-text");
                imageCardText.innerHTML = clock.what.month(thisTime) + " " + clock.what.day(thisTime) + ", " + clock.what.year(thisTime);
                imageCardDiv.appendChild(imageCardText);
                doc.getElementById("images-section").appendChild(imageCardDiv);
            });
        });        
    }

    function getActiveDialogSection(){
        var dialogBody = doc.querySelector(".mdc-dialog__body");
        var sections = dialogBody.getElementsByTagName("section");
        for (var i = 0, section; section = sections[i]; i++) {
            if(section.classList.contains("active")){
                return(section.id);
            }
        }
    }

    function inputMaskHandler(){
        adminUrlTargetElement = this.nextElementSibling;
        this.nextElementSibling.click();
    }
    function isAdmin(){
        return new Promise(function(resolve, reject){
            var docRef = firebase.firestore().collection("validator");
            docRef.get().then(function(result) {
                if (result) {
                    resolve (true);
                }
            }).catch(function(error) {
                resolve (false);
            });
        });
    }
    function processAccess(){
        isAdmin().then(function(res){
            if (res === true) {
                applyAdminView();
            } else {
                removeAdminView();
            }            
        });
    }
    function removeAdminView(){
        for (var i = 0; i < adminNavAnchors.length; i++) {
            adminNavAnchors[i].classList.add("hidden");
        }
    }
    function resetDialogSections(){
        var dialogBodySections = doc.querySelectorAll(".mdc-dialog__body > section");
        for (var i = 0; i < dialogBodySections.length; i++) {
            dialogBodySections[i].classList.remove("active");
            dialogBodySections[i].classList.add("hidden");
        }
    }
    function showHomeSection(){
        if(doc.getElementById("home-section")){
            doc.getElementById("home-section").classList.remove("hidden");
            doc.querySelector("body > nav > section > span:nth-of-type(1)").classList.add("bold");            
        }
    }
    function unboldNavAnchors(){
        var navLinks = doc.querySelectorAll("body > nav > section > .nav-span");
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].classList.remove("bold");
        }
    }

    /*
    clock.js v0.1 - Simple datetime add-on tools for JavaScript
    Created by Ron Royston, https://rack.pub
    https://github.com/rhroyston/clock-js
    License: MIT
    */
    var clock=function(){function d(){this.time=function(a){var b=h(a);if(b){var c=new Date(b),d=c.getHours(),e=("0"+c.getMinutes()).slice(-2);return d<12?d+":"+e+" AM":d-12+":"+e+" PM"}},this.weekday=function(b){var c=h(b);if(c)for(var d=new Date(c),e=0;e<a.length;e++)if(d.getDay()===e)return a[e]},this.day=function(a){var b=h(a);if(b)return new Date(b).getDate()},this.month=function(a){var c=h(a);if(c)for(var d=new Date(c),e=0;e<b.length;e++)if(d.getMonth()===e)return b[e]},this.year=function(a){var b=h(a);if(b)return new Date(b).getUTCFullYear()}}function e(){this.years=31536e6,this.months=2628002880,this.weeks=6048e5,this.days=864e5,this.hours=36e5,this.minutes=6e4,this.seconds=1e3}function f(a){var b=Math.floor(a/31536e3);return b>1?b+" years":(b=Math.floor(a/2592e3),b>1?b+" months":(b=Math.floor(a/86400),b>1?b+" days":(b=Math.floor(a/3600),b>1?b+" hours":(b=Math.floor(a/60),b>1?b+" minutes":Math.floor(a)+" seconds"))))}function h(a){var b="clock.js error",d={name:b,message:"expected unix timestamp as argument"};try{if(null==a||""==a)return c.now;if("string"==typeof a){if(a=a.replace(/\s/g,""),!/^\d+$/.test(a))throw d;a=Number(a)}if(new Date(a).getTime()>0)return a;throw d}catch(a){return console.log(a.name+" : "+a.message),null}}var a=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],b=["january","february","march","april","may","june","july","august","september","october","november","december"],c={};return c.what=new d,c.unit=new e,Object.defineProperty(c,"now",{get:function(){return Date.now()}}),Object.defineProperty(c,"time",{get:function(){var a=new Date,b=a.getHours(),c=("0"+a.getMinutes()).slice(-2);return b<12?b+":"+c+" AM":12==b?b+":"+c+" PM":b-12+":"+c+" PM"}}),Object.defineProperty(c,"weekday",{get:function(){for(var b=new Date,c=0;c<a.length;c++)if(b.getDay()===c)return a[c]}}),Object.defineProperty(c,"day",{get:function(){return(new Date).getDate()}}),Object.defineProperty(c,"month",{get:function(){for(var a=new Date,c=0;c<b.length;c++)if(a.getMonth()===c)return b[c]}}),Object.defineProperty(c,"year",{get:function(){return(new Date).getUTCFullYear()}}),c.since=function(a){var b=h(a);if(b){var c=Math.floor((new Date-b)/1e3);return f(c)}},c.until=function(a){var b=h(a);if(b){var c=Math.floor((b-new Date)/1e3);return f(c)}},c}();
}());
    
    
    
    
