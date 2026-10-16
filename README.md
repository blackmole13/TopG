# TOPGIRL Artist Database

This static site contains the artist directory, season party results, a read-only published favorite artist order, and a published leveling plan viewer. It does not include roster management, save/restore, or level and affection management. Artist data and images are copied from the application source. The local app publishes the selected favorite order and season activity to favorites.json; the season filter preference is stored in the visitor's browser localStorage.

## GitHub Pages

For repository blackmole13/TopG, configure Settings ? Pages ? Deploy from a branch ? main / (root). The site URL is https://blackmole13.github.io/TopG/.

GitHub Pages sites are public by default. A private source repository does not make the website private. Enable Pages only when a public site is intended.

There is no build step. Publishing season party results or a leveling plan from the local app updates the corresponding result and page files on main. Refresh the artist directory from data/artists.json and public/images/artists/ in the source project.
