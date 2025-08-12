import React from 'react';
import MyPetForm from '../components/MyPet/MyPetForm';

function MyPetPage({ user }) {
    return <MyPetForm user={user} />;
}

export default MyPetPage;