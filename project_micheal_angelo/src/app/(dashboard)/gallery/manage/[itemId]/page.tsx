'use client';

import React from 'react';
import { useRouter } from 'next/router';

const ManageArtworkPage: React.FC = () => {
    const router = useRouter();
    const { itemId } = router.query;

    return (
        <div>
            {itemId}
        </div>
    );
};

export default ManageArtworkPage;