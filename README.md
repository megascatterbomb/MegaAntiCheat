## DISCLAIMER:

This project is still in development and is NOT released. Details provided below accurately represent our intention at the time of writing, however all these details are subject to change as the project progresses.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Terminology](#terminology)
- [Installation](#installation)
- [License](#license)

## About

MegaAntiCheat is a powerful anti-cheat tool developed specifically for Team Fortress 2. It leverages the collective efforts of the community to identify cheaters through crowd-sourced demo recordings, enabling users to take appropriate action against cheaters. In addition to maintaining a public database of known cheaters, MegaAntiCheat offers a unique feature that allows users to maintain their own local databases individually or with friends.

With MegaAntiCheat, casual TF2 players and community server administrators can automatically prevent cheaters from entering their servers. With enough users, the entirely of casual TF2 can be protected.

## Features

- **Fully automated:** Even if the user forgets they have MegaAntiCheat installed, they are still contributing to its function. 
- **Evidence-based approach:** Users automatically contribute demo recordings of their games to the "MasterBase" database, helping to build a comprehensive repository of cheater behaviour.
- **VAC replacement:** MegaAntiCheat analyzes demo recordings using advanced algorithms to detect and flag suspicious behavior.
- **Public cheater database:** Known cheaters are stored in a public database accessible to the community, enabling them to automatically identify and take action against cheaters.
- **Coordinated kick process:** MegaAntiCheat integrates with multiple users' game clients to automate the kick process, preventing identified cheaters from ruining the game.
- **Community-powered:** MegaAntiCheat relies on the active participation of the Team Fortress 2 community to report and identify cheaters.

## Terminology

- **Cheaters** and related terms:
  - **Cheater** refers to players using third-party software to gain an unfair advantage in Team Fortress 2. In the context of MegaAntiCheat, the word "cheater" refers strictly to human cheaters.
  - **Bot** refers to third-party automated accounts that aren't controlled by a human.
  - **Mark** refers to the action of a local client marking a player as a cheater/bot/suspicious.
  - **Conviction** refers to the MasterBase detecting a cheater via its algorithms with enough certainty that it publically communicates that conviction to all local databases.
- **Local Client:** The client that runs on the user's computer and integrates with Team Fortress 2. The local client is responsible for recording demos automatically, uploading them to the MasterBase, and hosting the WebUI.
- **Web UI:** The local client's main interface is a webpage that can be accessed via the Steam Overlay. The WebUI displays information about the current TF2 game, including the names and IDs of any cheaters, and provides options to deal with them.
- **Local Database:** Local clients interact with local databases. This database can either run alongside the local client, or run headless (without a local client).
  - When a user marks a player as a cheater or bot, that mark is stored in the local database.
  - In headless mode, multiple local clients can connect to the database, allowing the sharing of information between multiple users e.g. a friend group.
  - Headless databases can operate via a discord bot, allowing interaction outside of the Web UI. 
- **MasterBase:** Every local database and local client communicates with the singular MasterBase. The MasterBase consists of several components that act in unison to prevent cheaters from operating in the game:
  - ***Jensen:*** This component uses Machine Learning and other advanced algorithms to scan demo recordings for suspicious activity. Jensen can calculate the likelihood a player has an unfair advantage, and uses this information to priortise further analysis. If the likelihood of cheating is overwhelmingly high, they are convicted as a cheater in the MasterBase.
  - ***Big Brother:*** This component is the public-facing web interface that's available at <a>megascatterbomb.com</a>. Users can query the MasterBase to find out about a user's cheating history. Big Brother also communicates with local databases in the background so that every MegaAntiCheat user is aware of convicted cheaters. Big Brother can also communicate with community servers via a SourceMod plugin, ensuring community servers are protected.
  - ***Interceptor:*** This component coordinates local clients that are in the same TF2 server. If enough local clients are in a game to guarantee a *convicted* cheater can be vote-kicked, the MasterBase will inform the local clients this is the case, triggering a vote, and each local client will automatically participate in kicking the cheater.
    - ***Local Interceptor:*** Coordinates local databases that agree a player is a cheater or bot. For example, if three users from Database A, two from Database B, and one from Database C are all on the same team, and all three databases have marked a particular account as a bot, MasterBase can instruct all six local clients to coordinate a vote-kick.
    - Local databases *cannot* trigger Local Interceptor by themselves; MasterBase will only allow Local Interceptor to trigger if it trusts all the involved users. New users and users suspected of abusing this feature won't be able to use it.
    - In the event not enough MegaAntiCheat users are present, all MegaAntiCheat users in that game will be informed how many MegaAntiCheat users are on their team and on the opposing team. From there, it's the users' responsibility to coordinate the vote-kick.

## Installation

// TODO

## License

This repository and its contents is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. See LICENSE.md for a copy of the full license.