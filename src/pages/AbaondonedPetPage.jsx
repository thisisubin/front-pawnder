import React from 'react';
import AbandonedPetForm from '../components/Abandon/AbandonedPetForm';

function AbandonedPetPage({ user }) {
    return (
        <AbandonedPetForm user={user} />
    );
}

export default AbandonedPetPage;