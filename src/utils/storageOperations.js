export const saveAndUpdateItems = async (storage, newItem, setItems) => {
  try {
    const id = await storage.saveItem(newItem);
    if (id) {
      setItems(prev => [...prev, { ...newItem, id }]);
    } else {
      console.warn('Saved item missing ID:', newItem);
    }
  } catch (error) {
    console.error('Error saving item:', error);
  }
};

export const updateAndRefreshItems = async (storage, id, updates, setItems) => {
  try {
    // console.log('Storage update - ID:', id, 'Updates:', updates);
    await storage.updateItem(id, updates);
    // console.log('Storage update successful');
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

// Section operations
export const saveAndUpdateSections = async (storage, newSection, setSections) => {
  try {
    const id = await storage.saveSection(newSection);
    if (id) {
      const sectionWithId = { ...newSection, id };
      setSections(prev => [...prev, sectionWithId]);
    }
    return id;
  } catch (error) {
    console.error('Error saving section:', error);
    throw error;
  }
};

export const updateAndRefreshSections = async (storage, id, updates, setSections) => {
  try {
    await storage.updateSection(id, updates);
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
};

export const deleteAndRemoveSection = async (storage, id, setSections) => {
  try {
    await storage.deleteSection(id);
    setSections(prev => prev.filter(section => section.id !== id));
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
}; 