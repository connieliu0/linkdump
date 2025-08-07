# PasteArea.jsx Architecture Diagram

```mermaid
graph TB
    subgraph "PasteArea Component"
        PA[PasteArea.jsx]
        
        subgraph "State Management"
            SM[State Variables]
            SM --> |storageMode| SM1[local/collaborative]
            SM --> |boardId| SM2[Board ID]
            SM --> |items| SM3[Array of Cards]
            SM --> |selectedId| SM4[Selected Card ID]
            SM --> |timeSettings| SM5[Time Configuration]
            SM --> |isExpired| SM6[Expiry Status]
            SM --> |isDragging| SM7[Drag State]
            SM --> |isInputActive| SM8[Input State]
        end
        
        subgraph "Storage Layer"
            SL[Storage Adapters]
            SL --> |local| SL1[IndexedDB Adapter]
            SL --> |collaborative| SL2[Firebase Adapter]
            SL --> |factory| SL3[Storage Factory]
        end
        
        subgraph "Card Components"
            CC[Card Types]
            CC --> |image| CC1[ImageCard]
            CC --> |link| CC2[LinkCard]
            CC --> |text| CC3[TextCard]
        end
        
        subgraph "UI Components"
            UI[UI Elements]
            UI --> |toolbars| UI1[TopToolbar & BottomToolbar]
            UI --> |dialogs| UI2[ExpiryDialog, MergedDialog, ConvertToCollaborativeDialog]
            UI --> |overlay| UI3[InactivityOverlay]
            UI --> |canvas| UI4[PanZoom Canvas]
        end
        
        subgraph "Event Handlers"
            EH[Event Management]
            EH --> |paste| EH1[handlePaste]
            EH --> |mouse| EH2[handleMouseMove]
            EH --> |keyboard| EH3[handleKeyDown]
            EH --> |drag| EH4[onElementsChange]
        end
        
        subgraph "Utility Functions"
            UF[Utilities]
            UF --> |card creation| UF1[createImageCard, createLinkCard, createTextCard]
            UF --> |storage ops| UF2[saveAndUpdateItems, updateAndRefreshItems, deleteAndRemoveItem]
            UF --> |image processing| UF3[processImage, extractImageFromClipboard]
            UF --> |layout| UF4[layoutArenaItems]
        end
        
        subgraph "Hooks"
            H[Hooks]
            H --> |aging| H1[useAgingEffect]
            H --> |paper aging| H2[usePaperAgingEffect]
        end
    end
    
    subgraph "External Dependencies"
        ED[Dependencies]
        ED --> |panzoom| ED1[@sasza/react-panzoom]
        ED --> |animation| ED2[framer-motion]
        ED --> |storage| ED3[Firebase, IndexedDB]
    end
    
    subgraph "Data Flow"
        DF[Data Flow]
        DF --> |paste event| DF1[Clipboard Data]
        DF --> |process| DF2[Image/Text/Link Detection]
        DF --> |create| DF3[Card Creation]
        DF --> |save| DF4[Storage Persistence]
        DF --> |render| DF5[UI Update]
    end
    
    subgraph "Storage Modes"
        SMODE[Storage Modes]
        SMODE --> |local| SMODE1[IndexedDB - Single User]
        SMODE --> |collaborative| SMODE2[Firebase - Multi User]
    end
    
    subgraph "Card Lifecycle"
        CL[Card Lifecycle]
        CL --> |create| CL1[Card Creation]
        CL --> |update| CL2[Card Updates]
        CL --> |drag| CL3[Drag Operations]
        CL --> |delete| CL4[Card Deletion]
    end
    
    %% Connections
    PA --> SM
    PA --> SL
    PA --> CC
    PA --> UI
    PA --> EH
    PA --> UF
    PA --> H
    
    SM --> SL
    CC --> UI
    EH --> UF
    UF --> SL
    
    ED --> PA
    DF --> PA
    SMODE --> SL
    CL --> CC
```

## Key Architectural Features

### 1. **State Management**
- Complex state management with multiple interconnected states
- Storage mode switching (local/collaborative)
- Real-time synchronization for collaborative mode
- Time-based expiry system

### 2. **Storage Abstraction**
- Factory pattern for storage adapters
- Support for both local (IndexedDB) and collaborative (Firebase) storage
- Automatic storage mode detection based on URL

### 3. **Card System**
- Three card types: Image, Link, and Text
- Unified card creation and management system
- Drag-and-drop functionality with PanZoom integration

### 4. **Event Handling**
- Comprehensive paste event handling
- Mouse and keyboard event management
- Drag operation handling with position persistence

### 5. **UI Components**
- Modular toolbar system (top and bottom)
- Dialog system for various interactions
- Inactivity overlay for time-based features
- Animated canvas with PanZoom

### 6. **Utility Layer**
- Image processing utilities
- Card management functions
- Storage operation abstractions
- Layout algorithms for imported content

### 7. **Real-time Features**
- Collaborative board support
- Real-time updates via Firebase listeners
- URL-based board sharing
- Time-based expiry and inactivity detection

This architecture provides a robust, scalable foundation for a collaborative paste board application with support for multiple content types and real-time collaboration. 