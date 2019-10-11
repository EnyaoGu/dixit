exports.Cards = class Cards {
    constructor() {
        this.capacity = 80;
        this.lib = this.genCardLib(this.capacity);
    }

    deliverCards(room){
        room.players.forEach(player => {
            if(this.lib.length >= room.maxClients*5)
            {
                player.holdingCards = this.cardsOneShare(this.lib, 5);
            }
            else
            {
                console.warn("We don't have enough cards for all players.");
            }
        });
    }

    replenishCard(room){
        room.players.forEach(player => {
            if(this.lib.length > room.maxClients)
            {
                player.holdingCards = this.cardsOneShare(this.lib, 1);
            }
            else
            {
                console.warn("We are out of cards! Start a new game.");
            }
        });
    }

    genCardLib(capacity){
        var cardLib = [];
        for(var i=1;i<= capacity;i++)
        {
            cardLib.push(i.toString());
        }
        return cardLib;
    }

    cardsOneShare(cardLib, number){
        var cardsOneShare = [];
        if(number >0)
        {
                for(var i =0; i< number; i++)
            {
                var index = Math.floor(Math.random()*(cardLib.length - 1) +1);
                cardsOneShare.push(cardLib[index]);
                cardLib.splice(index,1);
            }
            return cardsOneShare;
        }
    }
}
