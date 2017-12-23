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

### Installation

Create a Firebase project from the Firebase console.
Under the Overview section click on "Add Firebase to your web app".
From the Firebase console, go to Authentication > Templates tab and remove `/__/auth/action` from the Action URL - we don't need it. 
Keep the query parameters in the Action URL (the text after the ?).

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