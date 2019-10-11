exports.Cards = class Cards {
}

Cards.Capacity = 80;
Cards.lib = genCardLib(this.capacity);

function deliverCards(room){
    var cardLib = this.lib;
    room.players.forEach(player => {
        player.holdingCards = cardsOneShare(cardLib);
    });
}

function selectCard(room, playerId){
    
}

function genCardLib(capacity){
    var cardLib = new Array();
    for(var i=1;i<=capacity;i++)
    {
        cardLib.push(i.toString());
    }
    return cardLib;
}

function cardsOneShare(cardLib){
    var cardsOneShare = new Array();
    for(var i =0; i<5; i++)
    {
        var tag = Math.floor(Math.random()*79 +1).toString();
        if (cardsOneShare.find(function(card) {return card == tag}) == undefined)
        {
            cardsOneShare.push(tag);
            cardLib.pop(tag);
        }
    }
    return cardsOneShare;
}