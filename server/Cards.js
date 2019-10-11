exports.Cards = class Cards {
    constructor() {
        this.capacity = 80;
        this.lib = genCardLib(this.capacity);
    }

    deliverCards(room){
        var cardLib = this.lib;
        room.players.forEach(player => {
            player.holdingCards = cardsOneShare(cardLib);
        });
    }

    selectCard(room, playerId){
        
    }

    genCardLib(capacity){
        var cardLib = new Array();
        for(var i=1;i<= capacity;i++)
        {
            cardLib.push(i.toString());
        }
        return cardLib;
    }

    cardsOneShare(cardLib){
        var cardsOneShare = [];
        for(var i =0; i<5; i++)
        {
            var index = Math.floor(Math.random()*(cardLib.length - 1) +1);
            cardsOneShare.push(cardLib[index]);
            // cardLib.pop(tag);
        }
        return cardsOneShare;
    }
}
