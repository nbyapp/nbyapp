# User Generated Apps

This directory contains applications generated by the NBYApp platform.

Each app will be stored in its own directory with the following structure:

```
userapps/
  ├── app_id_1/
  │   ├── index.html
  │   ├── styles.css
  │   ├── app.js
  │   └── metadata.json
  ├── app_id_2/
  │   ├── index.html
  │   ├── styles.css
  │   ├── app.js
  │   └── metadata.json
  └── ...
```

In the current implementation, apps are stored in the browser's localStorage for simplicity. In a production environment, this directory would be used to persistently store the generated applications on the server.