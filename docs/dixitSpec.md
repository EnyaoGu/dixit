Workflow:
1. Open website, log in with user name. (no check)
2. Only one room, 4 players. Start when there are 4.
3. Assign the first player as the teller. Assign 5 cards/player.
4. Teller choose a card, type a word and confirm.
5. All players see the word.   Each one must choose a card and confirm.
6. Show all cards on the table.
7. The other 3 players now choose and confirm.
8. If these 3 are done, then calc the score. 
9. Show the result: each card has an owner and list of voters.  Each player's score.
10. Next "turn" button.

RoomState:
```js
{
    this.state = this.setState({
      round: -1,
      gamePhase: GamePhase.Boarding,
      players: [JSON.stringfy({
        id: 'string',
        name: 'string',
        isTeller: 'boolean', 
        holdingCards: [ 'string' ],
        usingCard: 'string',
        voteCard: 'string',
        hasBeenTellerForTimes: 'number',
        score: 'number',
        roundScore: 'number',
        isReady: 'boolean',
      })],
      theWord,
    })
}
```

Message from client to server
```js
{
  messageType = 'string',
  selectedCard? = 'string',
  votedCard? = 'string',
  theWord? = 'string',
};
```