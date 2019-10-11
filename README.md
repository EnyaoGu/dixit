# dixit
For innovation day

## Install
```bash
npm install yarn -g
yarn install
```

## Start
Two servers are needed: one for frontend content distribution:
```bash
npm run start:front
```

And one for backend game server:
```bash
npm run start:back
```


## Note

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
	round: number,
	phase: string,
	players: [{
		id: string,
		name: string,
		isTeller: boolean,
		handCards: string[],
		usingCard: string,
		voteCard: string,
		hasBeenTellerForTimes: number,
	}]
	theWord:string,
	score:{
		'PlayerId':number,
		...otherPlayers,
	}
}
```

