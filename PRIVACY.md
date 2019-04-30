# tracespace privacy policy

- The tracespace npm libraries do not collect nor store any usage data or personal information
- The tracespace view web-application collects de-identified usage data as detailed below **if you opt in** to usage tracking

We use [mixpanel][] to collect usage data. Mixpanel [respects your browser's Do Not Track (DNT) settings][mixpanel-dnt], so if you have DNT set, then tracespace will not collect usage data.

[mixpanel]: https://mixpanel.com/
[mixpanel-dnt]: https://help.mixpanel.com/hc/en-us/articles/360001113426-Opt-Out-of-Tracking#do-not-track-settings

## data stored

### tracespace view

tracespace view places full files in browser-side storage solely for the purpose of displaying those same files back to the user at a later time. These files are kept client-side and are not sent anywhere else. De-identified metadata about the files (see below) is collected if you opt in to usage tracking.

If you opt in to usage tracking, the following data is collected and stored by [mixpanel][] on behalf of tracespace:

- Mixpanel's [default JavaScript tracking properties][mixpanel-js], which include:
  - City and country based on IP address
  - Browser and OS
  - Window size
- When a board is rendered, saved, updated, downloaded, or deleted, including:
  - A content hashes of render source file set
    - This means we can observe that a unique set of files have been viewed
    - We **cannot** see the actual names nor contents of those files
    - A single change in a single file is enough to create an entirely different hash value
  - How files are opened, e.g. by URL or by drag-and-drop
  - Render time
  - Render settings
    - This allows us to better understand what settings are most common with our users
    - This helps decide default values for any settings that cannot be inferred
- Any render/storage errors that occur

For more information, see the [analytics module][view-analytics] in the @tracespace/view source code.

[mixpanel-js]: https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
[view-analytics]: ./apps/view/src/analytics

## requesting your data

If you would like a copy of the usage data we've collected from you, please email <privacy@tracespace.io> with your request. You will need to include your analytics user ID, which you can find by following the instructions below.

### tracespace view

Go to <https://tracespace.io/view/> and open the "app settings" menu by clicking the button at the top-right of the screen. Your analytics user ID will be displayed at the bottom of the settings menu.

## changes to this policy

Any updates to this policy and/or data collected will be reflected below. If we make large changes to this policy, we will clear your opt-in status so you can review the changes and re-affirm your opt-in.

### changelog

#### v4.1.0

- Anonymous basic usage analytics tracking added to tracespace view

## contact

Please contact <privacy@tracespace.io> with any questions or concerns.
