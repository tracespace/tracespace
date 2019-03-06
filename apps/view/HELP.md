# tracespace view troubleshooting

If you run into a problem that's not in this troubleshooting guide, please feel free to:

- [file an issue][issues]
- [chat on Gitter][gitter]
- email <help@tracespace.io>

[issues]: https://github.com/tracespace/tracespace/issues
[gitter]: https://gitter.im/tracespace/Lobby

## board not rendering

If your board isn't rendering properly, you can often get it to render by adjusting the board's settings by clicking the cog button next to the board's name.

Before changing any other settings, make sure that all your Gerber and drill files were identified correctly in the "layers" section at the bottom of the settings pop-up.

### no image or incorrect board shape

To figure out if there's a problem with the board outline layer, disable "render options" > "use outline layer for board shape".

The layer plotter can't always figure out the outline layer, especially if it has one or more of the following problems:

- Endpoints of segments that don't line up
- Multiple segments drawn over each other
- Drawings that aren't the outline itself (e.g. dimension callouts)

If your outline layer has segment endpoints that don't quite line up, enabling "render options" > "use outline layer for board shape" and setting the "render options" > "gap fill limit" to a number higher than the default could work.

### no drill holes

The coordinate format and units of drill files are sometimes hard for the parser to figure out. Double check your expected coordinate format and units from your CAD software, and enable the following rules if the auto-detection didn't work:

- "render options" > "override drill integer/decimal coordinate format"
- "render options" > "override drill zero suppression"
- "render options" > "override drill units"
