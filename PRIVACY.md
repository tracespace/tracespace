# tracespace privacy policy

The tracespace libraries do not collect nor store any usage data or personal information.

The tracespace view application collects anonymous usage data as detailed below if you opt-in to usage tracking.

We use [mixpanel][] to collect usage data. Mixpanel [respects your browser's Do Not Track (DNT) settings][mixpanel-dnt], so if you have DNT set, then tracespace will not collect usage data.

[mixpanel]: https://mixpanel.com/
[mixpanel-dnt]: https://help.mixpanel.com/hc/en-us/articles/360001113426-Opt-Out-of-Tracking#do-not-track-settings

## data stored

### tracespace view

The tracespace view app stores files uploaded by the user solely for the purpose of displaying those same file back to the user at a later time. Those files are kept in browser-side storage and are not sent anywhere else. Anonymous metadata about the files (see below) is collected if you have opted in to usage tracking.

If you opt in to usage tracking, the following data is collected and stored on behalf of tracespace by [mixpanel][]:

- Mixpanel's [default JavaScript tracking properties][mixpanel-js], which includes details such as:
  - City and country based on IP address
  - Browser and OS
  - Window size
- When board renders are created, viewed, updated, downloaded, or deleted, including:
  - Content hashes of render source files
    - This means we can observe that a unique set of files have been viewed
    - We **cannot** see the actual names nor contents of those files
  - How files are opened, e.g. by URL or by drag-and-drop
  - Render time
  - Render settings
    - This allows us to better understand what settings are most common with our users
    - This helps decide default values for any settings that cannot be inferred
- Any render/storage errors that occur

For more information, see the [@tracespace/view analytics module][view-analytics].

[mixpanel-js]: https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
[view-analytics]: ./apps/view/src/analytics

## requesting your data

If you would like to receive the usage data we've collected from you, please email <privacy@tracespace.io> with your request. You will need to include your analytics user ID, which you can find by following the instructions below.

### tracespace view

Go to <https://tracespace.io/view/> and open the "app settings" menu by clicking the button at the top-right of the screen. Your analytics user ID will be displayed at the bottom of the settings menu.

## changes to this policy

The tracespace libraries and/or applications may be updated in the future to collect anonymous usage data (for example, for the purposes of improving the user experience). Any such updates will be reflected in this document, and users will need to opt-in before any data is collected.

### changelog

#### v4.1.0

- Anonymous basic usage analytics tracking added to tracespace view

## contact

Please contact <privacy@tracespace.io> with any questions or concerns.
