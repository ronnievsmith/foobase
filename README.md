# Freebase
#### Firebase v4 Single Page APP TEMPLATE + MDC-Web + CSS Responsive Grid Layout

##### [freebase.rack.pub](https://freebase.rack.pub)

### Synopsis

A [Firebase Authentication (v4)](https://firebase.google.com/products/auth/) with [Material Components](//material.io/components) user interface, UI, template. Sign in with a token from your favorite social media platform or via email. 
This is an excellent starting point for your next Firebase web project.

<img src="https://github.com/rhroyston/rhroyston.github.io/blob/master/freebase.jpg" alt="screenshot" style="max-width:80%">

#### Features

 - Single page app implementation
 - Paste in your firebase project parameters and go
 - Account changes require email verification
 - Mobile First User Interface
   - Responsive CSS GRID layout
   - Material Components UI
   - photoURL resolution upgrades
 - [Gravatar](//gravatar.com) fallback for all accounts with an email address
 - Fallback avatar for 404 photoURL's
 - Promise based functions aligned with Firebase documentation
 - Simple JavaScript URL Argument Getter / Setter w Switch

### Installation & Usage

1. Create a Firebase project from the Firebase console.
1. Under the Overview section click on "Add Firebase to your web app".
   1. Paste these configuration parameters in `script.js`.
1. From the Firebase console, go to Authentication.
    1. Enable All forms of Authentication.
    1. Under the Templates Tab, remove `/__/auth/action` from the Action URL - we don't need it. 
    1. Keep the query parameters in the Action URL (the text after the ?).
1. Enable Firestore as your database.
    1. From the online console, add a new collection named `validator` and add a `field` `"secret"` with value of `"foo"`.
        1. This is going to be used for determining the privilege level of users. Our script will try and read this and if successful we know the user is an administrator.
    1. Paste the following rules into your `firestore.rules` file. NOTE: change the `uid` to your `uid`. Yours will be different. This is your administrator `uid` with write privileges.
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid == "8FwcgfTAk6T6VOWmNWu5I47BI7g1";
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId || request.auth.uid == "8FwcgfTAk6T6VOWmNWu5I47BI7g1";
    }
  }
}
```
1. Enable Firebase Storage.
    1. Paste the following rules into your `storage.rules` file. NOTE: change the `uid` to your `uid.
```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth.uid == "8FwcgfTAk6T6VOWmNWu5I47BI7g1";
    }
  }
}
```
1. Notice how the "Admin" section appears only for administrators?
1. Can you extend the app to have a multi-level admin? How about allowing users to vote on quotes or images?

### Contribute

If you found a bug, have any questions or want to contribute or collaborate please let me know, [ron@rack.pub](mailto:ron@rack.pub).

### License

Copyright 2018 Ron Royston, [https://rack.pub](https://rack.pub) All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License