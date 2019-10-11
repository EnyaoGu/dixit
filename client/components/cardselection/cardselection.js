import React, { useState } from 'react';
import { Button, Card, Carousel, Input } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import './cardselection.css';

const PageType = Object.freeze({
    tellerEnterDescription: 'teller enter description',
    playerPickCard: 'player Pick his card',
    vote: 'vote',
});

const CARDSELECTION = ({ cards, pageType, onCardSelected }) => {
    const [cardDescription, setCardDescription] = useState('');
    const [cardSelected, setCardSelected] = useState('');

    return <>
        <div className={'select-cards-wrapper'}>
            <Carousel afterChange={(index) => {
                setCardSelected(cards[index]);
            }}
            >
                <div>
                    <Card cover={<img src={cards[0]} />}/>
                </div>
                <div>
                    <Card cover={<img src={cards[1]} />}/>
                </div>
                <div>
                    <Card cover={<img src={cards[2]} />}/>
                </div>
                <div>
                    <Card cover={<img src={cards[3]} />}/>
                </div>
            </Carousel>
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
                            onPressEnter={() => onCardSelected(cardSelected, cardDescription)}
                        />
                        <Button
                            type='primary'
                            onClick={() => onCardSelected(cardSelected, cardDescription)}
                            size='large'
                            style={{marginLeft:5+'px'}}
                        >
                            Decide!
                        </Button>
                    </div>
                    : null
                }
                { pageType === PageType.playerPickCard ?
                    <Button
                        type='primary'
                        onClick={() => onCardSelected(cardSelected)}
                        size='large'
                    >
                        Use this card
                    </Button>
                    : null
                }
                { pageType === PageType.vote ?
                    <Button
                        type='primary'
                        onClick={() => onCardSelected(cardSelected)}
                        size='large'
                    >
                        Vote
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
    onCardSelected: PropTypes.func.isRequired,
};

export { CARDSELECTION, PageType };
