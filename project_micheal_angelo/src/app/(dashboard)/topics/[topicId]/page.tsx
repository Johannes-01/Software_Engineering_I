'use client';

import React from 'react';
import { useParams } from 'next/navigation';

const TopicPage: React.FC = () => {
    const { itemid } = useParams();

    return (
        <div>
            {itemid}
        </div>
    );
};

export default TopicPage;