## Dev

To be checkouted directly in the `js/plugins/` folder of the project. Plugins then need to be manually enabled in RMMZ.

Non-custom plugins are not tracked there. New custom plugins need to be added to the `.gitignore` before they can be tracked.

## Deployment

Additional files to be excluded on deployment (since there's a nice textbox "Exclude files/folders" [nowadays](https://steamcommunity.com/games/1096900/announcements/detail/527586104606458310)):

```
README.md,.gitignore,.prettierrc
```

Additional extensions to be excluded on deployment:

```
xcf
```
