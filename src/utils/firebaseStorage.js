import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';

export class FirebaseStorage {
  constructor(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
  }

  async saveItem(item) {
    try {
      const docRef = await addDoc(collection(this.db, this.collectionName), item);
      return docRef.id;
    } catch (error) {
      console.error('Error saving item to Firebase:', error);
      throw error;
    }
  }

  async updateItem(id, updates) {
    try {
      console.log('Firebase update - ID:', id, 'Updates:', updates);
      const itemRef = doc(this.db, this.collectionName, id);
      await updateDoc(itemRef, updates);
      console.log('Firebase update successful');
    } catch (error) {
      console.error('Error updating item in Firebase:', error);
      throw error;
    }
  }

  async deleteItem(id) {
    try {
      const itemRef = doc(this.db, this.collectionName, id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error deleting item from Firebase:', error);
      throw error;
    }
  }

  async loadItems() {
    try {
      const q = query(collection(this.db, this.collectionName), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading items from Firebase:', error);
      throw error;
    }
  }
} 