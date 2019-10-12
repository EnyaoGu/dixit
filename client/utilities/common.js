export const getCardImageUrl = (p_cardName) => {
    return `../../resources/${p_cardName}.png`;
}

export const getPlayerById = (p_players, p_id) => {
	return p_players.find((player) => player.id === p_id);
};