import { useEffect, useRef, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
/**
 * Custom hook for real-time auto-save functionality
 * Automatically saves form data to Firestore with debouncing
 */
export const useAutoSave = ({ collection, documentId, data, debounceMs = 800, enabled = true }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const timeoutRef = useRef();
    const lastSavedRef = useRef(null);
    const isLoadingRef = useRef(false);
    const isDraftRef = useRef(true);
    // Create document reference
    const docRef = doc(firestore, collection, documentId);
    // Save data to Firestore
    const saveData = useCallback(async (saveData) => {
        if (!enabled || !user || isLoadingRef.current)
            return;
        try {
            isLoadingRef.current = true;
            const enrichedData = {
                ...saveData,
                status: isDraftRef.current ? 'draft' : 'submitted',
                lastEditedBy: user.uid,
                lastEditedAt: new Date(),
                updatedAt: new Date(),
            };
            // If this is a new document, add createdAt
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                enrichedData.createdAt = new Date();
                enrichedData.createdBy = user.uid;
            }
            await setDoc(docRef, enrichedData, { merge: true });
            lastSavedRef.current = new Date();
            // Show success toast (optional, can be disabled for less intrusive UX)
            if (isDraftRef.current) {
                toast({
                    title: "Auto-saved",
                    description: "Your progress has been saved automatically",
                    duration: 2000,
                });
            }
        }
        catch (error) {
            console.error('Auto-save error:', error);
            toast({
                title: "Save Error",
                description: "Failed to auto-save. Please check your connection.",
                variant: "destructive",
                duration: 5000,
            });
        }
        finally {
            isLoadingRef.current = false;
        }
    }, [enabled, user, docRef, toast]);
    // Debounced save function
    const debouncedSave = useCallback((saveData) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            saveData(saveData);
        }, debounceMs);
    }, [debounceMs, saveData]);
    // Load existing draft data
    const loadDraft = useCallback(async () => {
        if (!enabled || !user)
            return null;
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                isDraftRef.current = data.status === 'draft';
                return data;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to load draft:', error);
            toast({
                title: "Load Error",
                description: "Failed to load saved progress",
                variant: "destructive",
            });
            return null;
        }
    }, [enabled, user, docRef, toast]);
    // Mark document as submitted and lock editing
    const markAsSubmitted = useCallback(async () => {
        if (!enabled || !user)
            return;
        try {
            isDraftRef.current = false;
            await setDoc(docRef, {
                status: 'submitted',
                submittedAt: new Date(),
                submittedBy: user.uid,
                lastEditedAt: new Date(),
            }, { merge: true });
            toast({
                title: "Submitted",
                description: "Form has been submitted successfully",
            });
        }
        catch (error) {
            console.error('Submit error:', error);
            toast({
                title: "Submit Error",
                description: "Failed to submit form. Please try again.",
                variant: "destructive",
            });
        }
    }, [enabled, user, docRef, toast]);
    // Auto-save when data changes
    useEffect(() => {
        if (data && enabled && isDraftRef.current) {
            debouncedSave(data);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, enabled, debouncedSave]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return {
        saveData,
        isLoading: isLoadingRef.current,
        lastSaved: lastSavedRef.current,
        loadDraft,
        markAsSubmitted,
        isDraft: isDraftRef.current,
    };
};
/**
 * Hook for generating unique document IDs for auto-save
 */
export const useAutoSaveId = (prefix, userId) => {
    const { user } = useAuth();
    const effectiveUserId = userId || user?.uid || 'anonymous';
    return useCallback((additionalId) => {
        const timestamp = Date.now();
        const base = `${prefix}_${effectiveUserId}_${timestamp}`;
        return additionalId ? `${base}_${additionalId}` : base;
    }, [prefix, effectiveUserId]);
};
