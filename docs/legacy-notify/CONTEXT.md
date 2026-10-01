> Superseded music-player handoff, preserved as history. Notify is now the assignment planner.

# Music Player Context

This glossary defines the product's music and account language. It does not prescribe implementation.

## Library and playback

**Music Library**:
The collection of audio recordings and metadata managed by the connected Navidrome server.
_Avoid_: App catalog, player database

**Track**:
A playable audio recording represented by the connected music server.
_Avoid_: Song file, unless referring specifically to the file on disk

**Queue**:
The ordered list of tracks waiting to play in the current listening session.
_Avoid_: Playlist, upcoming list

**Playlist**:
A named, server-owned collection of tracks that can be saved and played again.
_Avoid_: Queue

**Lyrics**:
Text associated with a track, optionally synchronized to playback time when the server provides timed lyrics.
_Avoid_: Captions

## People and services

**Player User**:
A person using this web player and owning player-specific preferences.
_Avoid_: Navidrome user, account (when the distinction matters)

**Navidrome Account**:
The credentialed identity that grants a person access to a Navidrome server and its user-specific music data.
_Avoid_: Player User

**Media Host**:
The always-on Ubuntu machine that runs Navidrome and has access to the persistent music files.
_Avoid_: App server, laptop (unless naming the physical device)

**Acquisition Automation**:
The optional workflow that searches for and imports music the user is authorized to obtain.
_Avoid_: Downloader (when referring to the whole workflow)
