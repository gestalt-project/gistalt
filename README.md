# Gestalt
testing redeploy

### To Do
Core
[] implement voting -> canonization
[] integrate web3 - auth & minting
[] clean up code structure
[] style
Other Features
[] implement gid retrospective
[] implement profile

### Logs
* restructuring1 - basic restructuring from folder-project-document model to story-gist-proposal model
* half-mvp - a bunch of stuff, including from my hazy memory: restructuring, integrating generative images, implementing proposal system, implementing canon display
* full-mvp - full mvp working

### Directory Structure

pages
```
pages
├── _app.js
├── api
│   └── auth
│       └── [...nextauth].js
├── documents
│   └── [did].js
├── folders
│   └── [fid].js
├── index.js
├── indexapi.js
└── projects
    └── [pid].js
```

components
```
components
├── Buttons.js
├── Files.js
├── Header.js
├── Login.js
├── Modals.js
├── SideBar.js
├── SideBarNav.js
├── TestAPI.js
├── TextEditor.js
├── TextEditor_payload.js
├── handleData.js
├── reqbackup.js
└── test.js
```

root
```
.
├── .env.local
├── firebase.js
├── next.config.js
└── tailwind.config.js
```