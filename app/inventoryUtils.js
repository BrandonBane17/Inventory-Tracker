import { firestore } from '@/firebase'
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

// Function to update inventory from Firebase
export const updateInventory = async () => {
  const snapshot = query(collection(firestore, 'inventory'));
  const docs = await getDocs(snapshot);
  const inventoryList = [];
  docs.forEach((doc) => {
    inventoryList.push({ name: doc.id, ...doc.data() });
  });
  return inventoryList;
};

// Function to add an item to the inventory
export const addItem = async (item) => {
  item = item.toLowerCase();
  const docRef = doc(collection(firestore, 'inventory'), item);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const { count } = docSnap.data();
    await setDoc(docRef, { count: count + 1 });
  } else {
    await setDoc(docRef, { count: 1 });
  }
};

// Function to remove an item from the inventory
export const removeItem = async (item) => {
  const docRef = doc(collection(firestore, 'inventory'), item);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const { count } = docSnap.data();
    if (count === 1) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { count: count - 1 });
    }
  }
};

// Function to increase the count of an item in the inventory
export const increaseItemCount = async (item) => {
  const docRef = doc(collection(firestore, 'inventory'), item);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const { count } = docSnap.data();
    await setDoc(docRef, { count: count + 1 });
  }
};
