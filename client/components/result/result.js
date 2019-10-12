import React  from 'react';
import { Button, Card } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import RESULTITEM from '../resultitem/resultitem'
import './result.css';
import { getCardImageUrl, getPlayerById } from '../../utilities/common';

const RESULT = ({ players, onConfirm, theWord }) => {
    const cards = players.map((p_player) => {
        return {
            src: getCardImageUrl(p_player.usingCard),
            voters: p_player.voters.map((p_voter) => getPlayerById(players, p_voter).name),
        };
    });
    return <>
        <div>
            <Card bordered={false} ><p>{theWord}</p></Card>
        </div>
        <div>
            <div className={'result-item-wrapper'}>
                <RESULTITEM card={cards[0]} />
                <RESULTITEM card={cards[1]} />
            </div>
            <div className={'result-item-wrapper'}>
                <RESULTITEM card={cards[2]}></RESULTITEM>
                <RESULTITEM card={cards[3]}></RESULTITEM>
            </div>
        </div>
        <div align={'center'}>
            <Button
                type='primary'
                size='large'
                onClick={onConfirm}
            >
                Next round
            </Button>
        </div>
        </>;
};

RESULT.propTypes = {
    players: PropTypes.array.isRequired,
    theWord: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default RESULT;
