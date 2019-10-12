import React, { useState } from 'react';
import { Button, Card, Carousel, Input } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import './cardselection.css';

const PageType = Object.freeze({
    tellerEnterDescription: 'teller enter description',
    tellerWaiting: 'teller wait for player pick and vote',
    playerWaiting: 'player waiting teller to enter description',
    playerPickCard: 'player Pick his card',
    vote: 'vote',
});

const getCardImageUrl = (p_cardName) => {
    return `../../resources/${p_cardName}.png`;
}

const CARDSELECTION = ({ cards, pageType, theWord, onConfirm }) => {
    const [cardDescription, setCardDescription] = useState('');
    const [cardSelected, setCardSelected] = useState(cards[0]);
    const [previousPageType, setPreviousPageType] = useState('');
    const [waitingStatus, setWaitingStatus] = useState(false);
    if (previousPageType !== pageType) {
        setWaitingStatus(false);
        setPreviousPageType(pageType);
    }

    let carouselHeader;
    let carouseButtonText;
    switch (pageType) {
    case PageType.tellerEnterDescription:
        carouselHeader = <Card bordered={false} ><p>Select one card and enter your description.</p></Card>;
        break;
    case PageType.tellerWaiting:
        carouselHeader = <Card bordered={false} ><p>Wait for other players select and vote.</p></Card>;
        break;
    case PageType.playerWaiting:
        carouselHeader = <Card bordered={false} ><p>Wait for the teller to select card and enter description.</p></Card>;
        break;
    case PageType.playerPickCard:
        carouselHeader = <Card bordered={false} ><p>Select your card for <b>{theWord}</b>.</p></Card>;
        carouseButtonText = 'Use this card';
        break;
    case PageType.vote:
        carouselHeader = <Card bordered={false} ><p>Find the teller's card for <b>{theWord}</b>.</p></Card>;
        carouseButtonText = 'Vote';
        break;
    }

    const items = [];
    for (const [index, value] of cards.entries()) {
        items.push(<Card key={index} bordered={false} cover={<img src={getCardImageUrl(value)} />}/>);
    }

    return <>
        <div className={'select-cards-wrapper'}>
            { pageType === PageType.playerPickCard && waitingStatus ?
                <div></div>
                :
                <div>
                    <div>
                        {carouselHeader}
                    </div>
                    <Carousel afterChange={(index) => {
                        setCardSelected(cards[index]);
                    }}
                    >
                        {items}
                    </Carousel>
                </div>
            }

            <div align={'center'} style={{marginTop:10+'px'}}>
                { pageType === PageType.tellerEnterDescription ?
                    <div className={'enter-description-wrapper'}>
                        <Input
                            id='card-description'
                            placeholder='Enter card description'
                            size='large'
                            onChange={(e) => {
                                setCardDescription(e.target.value);
                            }}
                            onPressEnter={() => onConfirm(cardSelected, cardDescription)}
                        />
                        <Button
                            type='primary'
                            onClick={() => onConfirm(cardSelected, cardDescription)}
                            size='large'
                            style={{marginLeft:5+'px'}}
                        >
                            Decide!
                        </Button>
                    </div>
                    : null
                }
                { (pageType === PageType.playerPickCard || pageType === PageType.vote) && !waitingStatus ?
                    <Button
                        type='primary'
                        onClick={() => {
                            onConfirm(cardSelected, cardDescription);
                            setWaitingStatus(true);
                        }}
                        size='large'
                    >
                        {carouseButtonText}
                    </Button>
                    : null
                }
            </div>
        </div>
        </>;
};

CARDSELECTION.propTypes = {
    cards: PropTypes.array.isRequired,
    pageType: PropTypes.string.isRequired,
    theWord: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export { CARDSELECTION, PageType };
