# Coup Game Logic - Complete Rewrite

## Overview
The Coup game logic has been completely rewritten to accurately follow the official Coup board game rules and fix numerous logical inconsistencies.

## Major Improvements

### 1. **Proper Action Definitions** (`state.js`)
- ✅ All 7 actions now properly defined with complete metadata:
  - **Income**: Take 1 coin (always succeeds, no challenge/block)
  - **Foreign Aid**: Take 2 coins (can be blocked by Duke, cannot be challenged)
  - **Coup**: Pay 7 coins to force influence loss (cannot be blocked or challenged)
  - **Tax** (Duke): Take 3 coins (can be challenged)
  - **Assassinate** (Assassin): Pay 3 coins to kill (can be challenged and blocked by Contessa)
  - **Steal** (Captain): Take 2 coins from player (can be challenged and blocked by Captain/Ambassador)
  - **Exchange** (Ambassador): Swap cards with deck (can be challenged)

### 2. **Character Blocking Rules** (`state.js`)
- ✅ Duke blocks Foreign Aid
- ✅ Contessa blocks Assassination
- ✅ Captain blocks Stealing
- ✅ Ambassador blocks Stealing
- ✅ Blocking requires claiming the appropriate character

### 3. **Mandatory Coup Rule** (`action.js`)
- ✅ Players with 10+ coins MUST coup (cannot do other actions)
- ✅ Validation prevents other actions when at 10+ coins

### 4. **Cost Handling** (`action.js`)
- ✅ Costs are deducted immediately when action is declared
- ✅ Costs are refunded if action is challenged and fails
- ✅ Costs are refunded if action is blocked
- ✅ Prevents exploits where players could "try" expensive actions without commitment

### 5. **Challenge System** (`response.js`)
- ✅ **Challenge Action**: Any player can challenge the actor's character claim
  - If actor has the card → Challenger loses influence, actor shuffles card back and draws new one, action succeeds
  - If actor doesn't have card → Actor loses influence, action fails, costs refunded
  
- ✅ **Challenge Block**: Only the actor can challenge a block
  - If blocker has the card → Actor loses influence, block succeeds
  - If blocker doesn't have card → Blocker loses influence, action succeeds

### 6. **Proper Card Revelation and Shuffling** (`action.js`)
- ✅ When showing a card after successful defense, player returns it to deck and draws new one
- ✅ Deck is properly shuffled after card return
- ✅ Lost influence cards are revealed permanently

### 7. **Turn Flow** (`action.js`)
- ✅ Proper turn advancement to next active player
- ✅ Skips eliminated players automatically
- ✅ Game ends when 1 player remains (winner) or 0 players (draw)
- ✅ Pending actions cleared at end of turn

### 8. **Response Windows** (`response.js`)
- ✅ **Action Phase**: All other players can challenge or block (if blockable)
- ✅ **Block Phase**: Only the actor can challenge the block
- ✅ Players can pass to allow action/block to proceed
- ✅ Action resolves when all eligible players have responded

### 9. **Target Validation** (`action.js`)
- ✅ Targeted actions require valid target
- ✅ Cannot target yourself
- ✅ Cannot target eliminated players
- ✅ Only target can block targeted actions (except Foreign Aid)

### 10. **Proper Action Resolution** (`action.js`)
```javascript
// Income: +1 coin
// Foreign Aid: +2 coins
// Coup: Target loses influence
// Tax: +3 coins
// Assassinate: Target loses influence
// Steal: Take up to 2 coins from target
// Exchange: Draw 2 cards, choose which to keep, return rest to deck
```

## Bug Fixes

### Previously Broken Logic:
1. ❌ No treasury tracking (unlimited coins from nowhere)
2. ❌ Character names inconsistent (DUKE vs Duke)
3. ❌ No mandatory coup at 10 coins
4. ❌ Costs not properly refunded on failed actions
5. ❌ Block system allowed anyone to block anything
6. ❌ Challenge system didn't handle card shuffling
7. ❌ Foreign Aid treated as challengeable (it's not)
8. ❌ Exchange didn't properly shuffle cards back
9. ❌ No validation for who can respond to blocks
10. ❌ Pending action states were confusing and overlapping

### Now Fixed:
1. ✅ Each player has their own coin count
2. ✅ Character keys are consistent (DUKE, ASSASSIN, etc.)
3. ✅ Mandatory coup enforced at 10+ coins
4. ✅ Proper cost tracking with `resolvedCost` in pending actions
5. ✅ Block validation checks if character can block that specific action
6. ✅ Successful challenges trigger card shuffle for defender
7. ✅ Foreign Aid marked as non-challengeable, but blockable
8. ✅ Exchange properly draws, selects, and returns cards
9. ✅ Only actor can challenge a block
10. ✅ Clear pending action states: `awaiting_response`, `awaiting_block_response`, `resolving`

## Game Flow Example

```
1. Player 1's Turn
   - Player 1 attempts Tax (claims Duke)
   - pendingAction set to awaiting_response
   
2. Response Window
   - Player 2, 3, 4 can challenge or pass
   - Player 2 passes
   - Player 3 passes
   - Player 4 passes
   
3. Action Resolves
   - Player 1 gets 3 coins
   - Turn advances to Player 2
```

```
1. Player 1's Turn
   - Player 1 attempts Assassinate on Player 3 (claims Assassin, pays 3 coins)
   - pendingAction set to awaiting_response
   
2. Response Window
   - Players 2, 3, 4 can challenge or block
   - Player 3 blocks (claims Contessa)
   - pendingAction changes to awaiting_block_response
   
3. Block Challenge Window
   - Only Player 1 can challenge the block
   - Player 1 challenges
   - Player 3 reveals Contessa
   - Player 1 loses influence
   - Block succeeds, assassination fails
   - Player 1 gets 3 coins refunded
   - Turn advances to Player 2
```

## Testing Checklist

- [ ] Income always gives 1 coin
- [ ] Foreign Aid gives 2 coins, can be blocked by Duke
- [ ] Coup costs 7, cannot be blocked
- [ ] Must coup at 10+ coins
- [ ] Tax (Duke) gives 3 coins, can be challenged
- [ ] Assassinate (Assassin) costs 3, can be challenged and blocked by Contessa
- [ ] Steal (Captain) takes up to 2 coins, can be challenged and blocked
- [ ] Exchange (Ambassador) works correctly with deck
- [ ] Successful challenge = defender shuffles card back
- [ ] Failed challenge = challenger loses influence
- [ ] Blocked action = actor gets refund
- [ ] Game ends when 1 player left

## Architecture

```
state.js         → Game constants, initial state, character/action definitions
action.js        → Action initiation, validation, resolution, helpers
response.js      → Challenge/block/pass handling
multiplayer.js   → Firebase integration (unchanged)
useCoupLogic.js  → React hook bridge (unchanged)
```

All game logic is pure functions operating on immutable game state. UI components remain unchanged.
