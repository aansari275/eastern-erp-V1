import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithRedirect, signInWithPopup, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../lib/firebase';
const provider = new GoogleAuthProvider();
// Configure for better compatibility with storage-partitioned environments
provider.setCustomParameters({
    prompt: 'select_account'
});
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const login = async () => {
        try {
            // First try popup authentication
            await signInWithPopup(auth, provider);
        }
        catch (error) {
            console.error('Sign-in error:', error);
            // If popup is blocked or storage-partitioned, use redirect
            if (error.code === 'auth/popup-blocked' ||
                error.code === 'auth/unauthorized-domain' ||
                error.message?.includes('storage-partitioned') ||
                error.message?.includes('sessionStorage')) {
                console.log('Popup blocked or storage issue, switching to redirect authentication');
                try {
                    await signInWithRedirect(auth, provider);
                }
                catch (redirectError) {
                    console.error('Redirect sign-in error:', redirectError);
                    alert('Authentication failed. Please try again or contact support.');
                }
            }
            else {
                alert('Sign-in failed. Please try again.');
            }
        }
    };
    const logout = async () => {
        await auth.signOut();
        setUser(null);
        setUserDoc(null);
    };
    useEffect(() => {
        // Check for redirect result first
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('✅ Redirect authentication successful');
                }
            }
            catch (error) {
                console.error('Redirect result error:', error);
                if (error.message?.includes('sessionStorage') || error.message?.includes('storage-partitioned')) {
                    console.log('Storage partitioning detected, clearing storage and retrying...');
                    // Clear storage and reload
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                    }
                    catch (storageError) {
                        console.warn('Could not clear storage:', storageError);
                    }
                }
            }
        };
        checkRedirectResult();
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    console.log('🔄 Starting user data fetch for:', firebaseUser.email, 'UID:', firebaseUser.uid);
                    // SKIP Firestore direct access - go straight to server endpoint for specific users
                    if (firebaseUser.email === 'lab.easternmills@gmail.com' ||
                        firebaseUser.email === 'abdulansari@easternmills.com') {
                        console.log('🎯 Special user detected, using server endpoint');
                    }
                    else {
                        // First, try to find user by UID for other users
                        const uidRef = doc(firestore, 'users', firebaseUser.uid);
                        const uidSnap = await getDoc(uidRef);
                        if (uidSnap.exists()) {
                            console.log('✅ Found user by UID in Firestore');
                            setUserDoc(uidSnap.data());
                            setLoading(false); // Set loading to false when user found by UID
                            return;
                        }
                    }
                    // Search by email using server endpoint (bypasses Firestore security rules)
                    try {
                        console.log('🔍 Searching for user with email:', firebaseUser.email);
                        const response = await fetch('/api/auth/user-by-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: firebaseUser.email }),
                        });
                        if (response.ok) {
                            const existingUserData = await response.json();
                            console.log('✅ Server returned user data:', existingUserData);
                            console.log('🔧 Extracting fields:', {
                                Role: existingUserData.Role,
                                role: existingUserData.role,
                                DepartmentId: existingUserData.DepartmentId,
                                department_id: existingUserData.department_id,
                                department: existingUserData.department
                            });
                            // Clear storage to force fresh data load
                            localStorage.clear();
                            sessionStorage.clear();
                            // Use ACTUAL Firestore data - map ALL fields correctly
                            const mappedUserDoc = {
                                ...existingUserData,
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || existingUserData.email || existingUserData.Email,
                                displayName: firebaseUser.displayName,
                                // Ensure ALL role/department fields are properly mapped from server response
                                Role: existingUserData.Role || existingUserData.role,
                                DepartmentId: existingUserData.DepartmentId || existingUserData.department_id || existingUserData.department,
                                role: existingUserData.Role || existingUserData.role,
                                department: existingUserData.DepartmentId || existingUserData.department_id || existingUserData.department,
                                department_id: existingUserData.DepartmentId || existingUserData.department_id || existingUserData.department,
                                isActive: existingUserData.isActive !== false,
                                // Add email field that matches what the server found
                                Email: firebaseUser.email || existingUserData.email || existingUserData.Email,
                            };
                            console.log('🔧 Mapped user doc from server data:', {
                                serverData: existingUserData,
                                mappedDoc: mappedUserDoc,
                                Role: mappedUserDoc.Role,
                                DepartmentId: mappedUserDoc.DepartmentId
                            });
                            console.log('✅ Setting userDoc with mapped data');
                            setUserDoc(mappedUserDoc);
                            console.log('✅ UserDoc set successfully, should trigger RBAC update');
                            setLoading(false); // Set loading to false immediately when user data is found
                            return; // Exit early, user found
                        }
                        else {
                            console.error('❌ Server user lookup failed:', response.status, response.statusText);
                        }
                    }
                    catch (fetchError) {
                        console.warn('Server user lookup failed, falling back to auto-create:', fetchError);
                    }
                    // Only create new user if not found by email - with LIMITED permissions
                    const newUser = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        department: 'quality', // Default new users to quality department
                        role: 'user', // Default to user role, not admin
                        DepartmentId: 'quality',
                        Role: 'user',
                        permissions: [], // No permissions by default
                        allowedTabs: [], // No tabs by default
                        isAuthorized: false, // Require explicit authorization
                    };
                    try {
                        const uidRef = doc(firestore, 'users', firebaseUser.uid);
                        await setDoc(uidRef, newUser);
                        console.log('✅ Auto-created authorized user:', firebaseUser.email);
                    }
                    catch (err) {
                        console.error('Firestore error (continuing anyway):', err);
                    }
                    setUserDoc(newUser);
                    setLoading(false); // Set loading to false for new user creation
                }
                catch (error) {
                    console.error('Firestore permission error - user needs proper authorization:', error);
                    // DO NOT auto-authorize - require proper Firestore setup
                    setUserDoc({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        department: null,
                        role: null,
                        DepartmentId: null,
                        Role: null,
                        permissions: [],
                        allowedTabs: [],
                        isAuthorized: false, // Require explicit authorization in Firestore
                    });
                    console.log('❌ User requires proper authorization in Firestore:', firebaseUser.email);
                }
            }
            else {
                // No user is signed in
                setUserDoc(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);
    return { user, userDoc, loading, login, logout };
};
