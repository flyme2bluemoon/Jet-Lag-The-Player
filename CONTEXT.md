# Jet Lag: The Player

Jet Lag: The Player is an unofficial fan-made companion for watching Jet Lag: The Game. Released episodes are the primary source for its game data.

## Language

**Season**:
One complete Jet Lag game released as an ordered set of **Episodes**.

**Supported season**:
A **Season** with its own **Live dashboard**.
_Avoid_: available season

**Episode**:
One released video within a **Season**. A finale is an episode label, not a separate content type.

**Player**:
An individual competitor in a **Season**.

**Team**:
A competing unit containing one or more **Players**. In an individual game, a **Player** may also act as a one-player team for scoring and display.

**Episode timestamp**:
A playback position identified by an **Episode** and the number of seconds into its video.

**Game state**:
Everything a **Live dashboard** may show at an **Episode timestamp**, limited to information revealed by that point.
_Avoid_: playback state

**Live dashboard**:
The playback-synchronized view for a **Supported season**. It updates and rewinds its **Game state** as the viewer plays or seeks.
_Avoid_: live companion dashboard

**Dashboard card**:
A panel in a **Live dashboard** that presents part of the **Game state**.

**Game card**:
A rules-defined card used by **Players** within a **Season**. It is part of the game, unlike a **Dashboard card**, which is part of the companion interface.

## Relationships

- A **Season** contains an ordered set of **Episodes**.
- A **Supported season** has one **Live dashboard** shared by its **Episodes**.
- A **Live dashboard** derives its **Game state** from the current **Episode timestamp**.
