import React  from 'react';
import { Button, Card } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import RESULTITEM from '../resultitem/resultitem'
import './result.css';

const RESULT = ({ cards }) => {
    return <>
        <div>
            <Card bordered={false} ><p>Description.</p></Card>
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
            >
                Next round
            </Button>
        </div>
        </>;
};

RESULT.propTypes = {
    cards: PropTypes.array.isRequired,
};

export default RESULT;
