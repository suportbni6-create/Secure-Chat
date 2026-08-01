import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Message, MessageType, ChatUser, CallData } from '../types';

const ROOM_ID = 'private-room';

const messagesRef = collection(db, 'rooms', ROOM_ID, 'messages');
const usersRef = collection(db, 'rooms', ROOM_ID, 'users');
const callsRef = collection(db, 'rooms', ROOM_ID, 'calls');

export const sendMessage = async (senderId: string, text: string, type: MessageType, mediaUrl?: string) => {
  await addDoc(messagesRef, {
    senderId,
    text,
    type,
    mediaUrl: mediaUrl || null,
    timestamp: Date.now(),
    delivered: true, // simplified for now
    read: false,
  });
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(msgs);
  });
};

export const markMessagesAsRead = async (myUid: string) => {
  // Find messages where senderId != myUid and read == false
  const q = query(messagesRef, where('senderId', '!=', myUid), where('read', '==', false));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
};

export const registerUser = async (uid: string) => {
  const userDoc = doc(usersRef, uid);
  await setDoc(userDoc, {
    uid,
    lastSeen: Date.now(),
    isOnline: true,
  }, { merge: true });
};

export const setOffline = async (uid: string) => {
  const userDoc = doc(usersRef, uid);
  await updateDoc(userDoc, {
    isOnline: false,
    lastSeen: Date.now(),
  });
};

export const subscribeToUsers = (callback: (users: ChatUser[]) => void) => {
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as ChatUser);
    callback(users);
  });
};

export const createCallOffer = async (callData: Omit<CallData, 'timestamp'>) => {
  const callDoc = doc(callsRef, 'active');
  await setDoc(callDoc, {
    ...callData,
    timestamp: Date.now(),
  });
};

export const answerCall = async (callData: Omit<CallData, 'timestamp'>) => {
  const callDoc = doc(callsRef, 'active');
  await setDoc(callDoc, {
    ...callData,
    timestamp: Date.now(),
  });
};

export const subscribeToCall = (callback: (data: CallData | null) => void) => {
  const callDoc = doc(callsRef, 'active');
  return onSnapshot(callDoc, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as CallData);
    } else {
      callback(null);
    }
  });
};

export const endFirebaseCall = async () => {
  const callDoc = doc(callsRef, 'active');
  await deleteDoc(callDoc);
};

export const addIceCandidate = async (callId: string, candidate: any, type: 'caller' | 'receiver') => {
  const candidatesRef = collection(db, 'rooms', ROOM_ID, 'calls', 'active', type + 'Candidates');
  await addDoc(candidatesRef, candidate.toJSON());
};

export const subscribeToIceCandidates = (type: 'caller' | 'receiver', callback: (candidate: any) => void) => {
  const candidatesRef = collection(db, 'rooms', ROOM_ID, 'calls', 'active', type + 'Candidates');
  return onSnapshot(candidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        callback(change.doc.data());
      }
    });
  });
};
