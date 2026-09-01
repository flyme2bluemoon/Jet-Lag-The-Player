# Season 18: Stateside Scramble

This context defines the Stateside Scramble concepts modeled by the Season 18 live dashboard. Shared product language is defined in the [root context](../../../../CONTEXT.md).

## Language

**State**:
Any claimable territory treated as a state by the game, including U.S. states, D.C., and Canada.
_Avoid_: board region

**Public card**:
A **Game card** available to either **Team**.

**Private card**:
A **Game card** available to one **Team**, with one added for that team each game day.

**Claim attempt**:
A **Team**'s active attempt to complete a **Game card**'s challenge for a **State**.

**Claim**:
A completed **Claim attempt** that assigns a **State** to a **Team**.

**Connected-state score**:
The number of **States** in a **Team**'s largest connected group of claimed states, using the game's adjacency rules.

**Travel budget**:
Each **Team**'s money for transportation.

**Area tiebreak**:
The comparison of the total land area claimed by each **Team** when their **Connected-state scores** are tied.

## Relationships

- A **Public card** or **Private card** may be used for a **Claim attempt** in any eligible **State**.
- Completing a **Claim attempt** creates a **Claim** and consumes its **Game card**.
- A **Team**'s **Claims** determine its **Connected-state score** and, when needed, the **Area tiebreak**.
