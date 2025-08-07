# Coordinate System

This module provides a coordinate system for converting between screen coordinates and canvas coordinates in the Linkdump application.

## Usage

```javascript
import { createCoordinateSystem } from './coordinates';

// Create a coordinate system instance
const coordinateSystem = createCoordinateSystem(canvasRef, transform);

// Convert screen coordinates to canvas coordinates
const canvasCoords = coordinateSystem.screenToCanvas(screenX, screenY);

// Convert canvas coordinates to screen coordinates
const screenCoords = coordinateSystem.canvasToScreen(canvasX, canvasY);
```

## Parameters

- `canvasRef`: A React ref to the canvas element
- `transform`: An object containing the current transform state
  - `x`: X translation offset
  - `y`: Y translation offset  
  - `scale`: Current zoom scale

## Functions

### screenToCanvas(screenX, screenY)
Converts screen coordinates to canvas coordinates, accounting for:
- Canvas position relative to viewport
- Current pan/zoom transform
- Scale factor

### canvasToScreen(canvasX, canvasY)
Converts canvas coordinates to screen coordinates, accounting for:
- Canvas position relative to viewport
- Current pan/zoom transform
- Scale factor

## Implementation Details

The coordinate system handles:
1. **Canvas positioning**: Uses `getBoundingClientRect()` to get the canvas position relative to the viewport
2. **Transform application**: Applies the current pan/zoom transform to convert between coordinate spaces
3. **Scale handling**: Properly scales coordinates based on the current zoom level

## Integration with PasteArea

The coordinate system is integrated into the PasteArea component to:
- Track mouse position in canvas coordinates
- Place pasted content at the correct canvas position
- Handle coordinate conversion for all mouse interactions

## Debugging

The coordinate system includes debug logging that can be enabled to see coordinate conversions in the browser console. 