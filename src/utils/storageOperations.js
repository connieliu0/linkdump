export const saveAndUpdateItems = async (storage, newItem, setItems) => {
  try {
    console.log('saveAndUpdateItems - Saving item:', newItem);
    const id = await storage.saveItem(newItem);
    console.log('saveAndUpdateItems - Got ID:', id);
    if (id) {
      setItems(prev => {
        const updated = [...prev, { ...newItem, id }];
        console.log('saveAndUpdateItems - Updated items count:', updated.length);
        return updated;
      });
    } else {
      console.warn('Saved item missing ID:', newItem);
    }
  } catch (error) {
    console.error('Error saving item:', error);
  }
};

export const updateAndRefreshItems = async (storage, id, updates, setItems) => {
  try {
    console.log('Storage update - ID:', id, 'Updates:', updates);
    await storage.updateItem(id, updates);
    console.log('Storage update successful');
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteAndRemoveItem = async (storage, id, setItems) => {
  try {
    await storage.deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}; 