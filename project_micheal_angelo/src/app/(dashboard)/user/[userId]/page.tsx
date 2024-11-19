'use client';

import React from 'react';
import { useParams } from 'next/navigation';

const UserPage: React.FC = () => {
    const { userId } = useParams();

    return (
        <div>
            <h1>User Page</h1>
            <p>User ID: {userId}</p>
        </div>
    );
};

export default UserPage;