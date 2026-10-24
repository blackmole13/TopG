# TOPGIRL Artist Database

This static site contains the artist directory, season party results, a read-only published favorite artist order, and an interactive published leveling plan. The leveling page starts from the current levels captured from the local app and lets visitors adjust both starting and target levels in their browser; fixed promotion settings come from the published plan. Browser changes are session-only and never update the local app. It does not include roster management, account sync, or affection management. Artist data and images are copied from the application source. The local app publishes the selected favorite order and season activity to favorites.json; browser-only preferences stay on the visitor's device.

## GitHub Pages

For repository blackmole13/TopG, configure Settings ? Pages ? Deploy from a branch ? main / (root). The site URL is https://blackmole13.github.io/TopG/.

GitHub Pages sites are public by default. A private source repository does not make the website private. Enable Pages only when a public site is intended.

There is no build step. Publishing season party results or a leveling plan from the local app updates the corresponding result and page files on main. Refresh the artist directory from data/artists.json and public/images/artists/ in the source project.
