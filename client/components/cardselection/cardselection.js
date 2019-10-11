import React, { useState } from 'react';
import { Button, Card, Carousel, Input } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import './cardselection.css';

const CARDSELECTION = ({ cards, onCardSelected }) => {
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
            <Input
                id='card-description'
                placeholder='Enter the description for current card'
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
            >
                Decide!
            </Button>
        </div>
        </>;
};

CARDSELECTION.propTypes = {
    cards: PropTypes.array.isRequired,
    onCardSelected: PropTypes.func.isRequired,
};

export default CARDSELECTION;
