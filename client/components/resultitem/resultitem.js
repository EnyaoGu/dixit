import React  from 'react';
import { Card } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import './resultitem.css';

const RESULTITEM = ({ card }) => {
    const items = [];
    for (const [index, value] of card.voters.entries()) {
        items.push(<li key={index}>{value}</li>);
    }

    return <>
        <Card style={{ width: 156, margin: 2+'px' }} bordered={false} cover={<img src={card.src} />}>
            <ol>
                {items}
            </ol>
        </Card>
    </>;
};

RESULTITEM.propTypes = {
    card: PropTypes.object.isRequired,
};

export default RESULTITEM;
