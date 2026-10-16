# TOPGIRL Artist Database

This static site contains the artist directory, season party results, favorite artist selection, and a published leveling plan viewer. It does not include roster management, save/restore, or level and affection management. Artist data and images are copied from the application source. Favorite artist selections and the season filter preference are stored in the visitor's browser localStorage.

## GitHub Pages

For repository blackmole13/TopG, configure Settings ? Pages ? Deploy from a branch ? main / (root). The site URL is https://blackmole13.github.io/TopG/.

GitHub Pages sites are public by default. A private source repository does not make the website private. Enable Pages only when a public site is intended.

There is no build step. Publishing season party results or a leveling plan from the local app updates the corresponding result and page files on main. Refresh the artist directory from data/artists.json and public/images/artists/ in the source project.
