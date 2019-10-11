import React  from 'react';
import { Card } from 'antd';
import 'antd/dist/antd.css';
import PropTypes from 'prop-types';
import './resultitem.css';

const RESULTITEM = ({ card }) => {
	const items = card.voters.map((value, index) =>
		<li key={index}>{value}</li>
	);

    return <>
        <Card style={{ width: 140, backgroundColor: 'lightcyan'}} bordered={false} cover={<img src={card.src} />}>
            <ul>
                {items}
            </ul>
        </Card>
    </>;
};

RESULTITEM.propTypes = {
    card: PropTypes.object.isRequired,
};

export default RESULTITEM;
