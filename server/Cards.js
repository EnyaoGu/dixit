exports.Cards = class Cards {
    constructor() {
        this.capacity = 53;
        this.lib = this.genCardLib(this.capacity);
    }

    deliverCards(room){
        if (this.lib.length >= room.maxClients*5) {
            room.state.players.forEach(player => {
                this.cardsOneShare(this.lib, 5).forEach((p_card) => player.holdingCards.push(p_card));
            });
        } else {
            console.warn("We don't have enough cards for all players.");
        }
    }

    replenishCard(room){
        if (this.lib.length > room.maxClients) {
            room.state.players.forEach(player => {
                player.holdingCards.push(this.cardsOneShare(this.lib, 1)[0]);
            });
        } else {
            console.warn("We are out of cards! Start a new game.");
        }
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

        for(var i =0; i< number; i++)
        {
            var index = Math.floor(Math.random()*(cardLib.length - 1) +1);
            cardsOneShare.push(cardLib[index]);
            cardLib.splice(index,1);
        }
        return cardsOneShare;
    }
}
