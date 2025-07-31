import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
export const useRugs = () => {
    const [rugs, setRugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!auth.currentUser)
            return;
        const userId = auth.currentUser.uid;
        const appId = 'rug-tracker'; // Fixed app ID for this application
        const rugsRef = collection(db, `artifacts/${appId}/users/${userId}/rug_creations`);
        const q = query(rugsRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rugsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            }));
            setRugs(rugsData);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error('Error fetching rugs:', err);
            setError('Failed to fetch rugs');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth.currentUser]);
    const addRug = async (rugData) => {
        if (!auth.currentUser)
            throw new Error('User not authenticated');
        const userId = auth.currentUser.uid;
        const appId = 'rug-tracker';
        const rugsRef = collection(db, `artifacts/${appId}/users/${userId}/rug_creations`);
        const newRug = {
            ...rugData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        await addDoc(rugsRef, newRug);
    };
    const updateRug = async (rugId, rugData) => {
        if (!auth.currentUser)
            throw new Error('User not authenticated');
        const userId = auth.currentUser.uid;
        const appId = 'rug-tracker';
        const rugRef = doc(db, `artifacts/${appId}/users/${userId}/rug_creations`, rugId);
        const updateData = {
            ...rugData,
            updatedAt: Timestamp.now(),
        };
        await updateDoc(rugRef, updateData);
    };
    const deleteRug = async (rugId) => {
        if (!auth.currentUser)
            throw new Error('User not authenticated');
        const userId = auth.currentUser.uid;
        const appId = 'rug-tracker';
        const rugRef = doc(db, `artifacts/${appId}/users/${userId}/rug_creations`, rugId);
        await deleteDoc(rugRef);
    };
    return {
        rugs,
        loading,
        error,
        addRug,
        updateRug,
        deleteRug,
    };
};
