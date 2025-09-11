import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface ImageAnnotatorProps {
  imageUrl: string;
  initialAnnotations?: any;
  onAnnotationChange: (annotations: any) => void;
  showAnnotations: boolean;
}

export function ImageAnnotator({
  imageUrl,
  initialAnnotations,
  onAnnotationChange,
  showAnnotations
}: ImageAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTool, setCurrentTool] = useState<'select' | 'rectangle' | 'circle' | 'arrow' | 'freehand'>('select');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('ImageAnnotator: Loading image with URL:', imageUrl);

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f8fafc',
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Reset error state
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);

    // Create a timeout for the image loading
    const loadTimeout = setTimeout(() => {
      setHasError(true);
      setErrorMessage('Image loading timed out. Please check the image URL.');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    // Try to load image with native Image first to test accessibility
    const testImg = new Image();
    
    testImg.onload = () => {
      console.log('ImageAnnotator: Native image loaded successfully, loading with fabric.js');
      clearTimeout(loadTimeout);
      
      // Load the image with Fabric.js
      fabric.Image.fromURL(imageUrl, (img) => {
        console.log('ImageAnnotator: Fabric.js Image loaded:', img);
        if (!img || !canvas) {
          setHasError(true);
          setErrorMessage('Failed to create fabric image object');
          setIsLoading(false);
          return;
        }

        try {
          // Calculate scaling to fit canvas while maintaining aspect ratio
          const canvasWidth = 800;
          const canvasHeight = 600;
          const imgWidth = img.width || 1;
          const imgHeight = img.height || 1;

          const scaleX = canvasWidth / imgWidth;
          const scaleY = canvasHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY);

          img.scale(scale);
          img.set({
            left: (canvasWidth - imgWidth * scale) / 2,
            top: (canvasHeight - imgHeight * scale) / 2,
            selectable: false,
            evented: false,
          });

          canvas.add(img);
          canvas.sendToBack(img);
          setIsLoading(false);

          // Load initial annotations if provided
          if (initialAnnotations) {
            try {
              canvas.loadFromJSON(initialAnnotations, () => {
                canvas.renderAll();
              });
            } catch (error) {
              console.error('Error loading annotations:', error);
            }
          }
        } catch (error) {
          console.error('Error processing loaded image:', error);
          setHasError(true);
          setErrorMessage('Error processing loaded image');
          setIsLoading(false);
        }
      });
    };
    
    testImg.onerror = (error) => {
      console.error('ImageAnnotator: Failed to load image:', error);
      clearTimeout(loadTimeout);
      setHasError(true);
      setErrorMessage(`Failed to load image from: ${imageUrl}`);
      setIsLoading(false);
    };
    
    testImg.src = imageUrl;

    // Handle canvas events
    canvas.on('path:created', () => {
      handleCanvasChange();
    });

    canvas.on('object:added', () => {
      handleCanvasChange();
    });

    canvas.on('object:modified', () => {
      handleCanvasChange();
    });

    canvas.on('object:removed', () => {
      handleCanvasChange();
    });

    // Mouse events for drawing
    canvas.on('mouse:down', (e) => {
      if (currentTool === 'select') return;
      
      setIsDrawing(true);
      const pointer = canvas.getPointer(e.e);
      
      if (currentTool === 'rectangle') {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: '#ef4444',
          strokeWidth: 2,
          selectable: true,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
      } else if (currentTool === 'circle') {
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 2,
          selectable: true,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
      }
    });

    canvas.on('mouse:move', (e) => {
      if (!isDrawing || currentTool === 'select') return;
      
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;
      
      const pointer = canvas.getPointer(e.e);
      
      if (currentTool === 'rectangle' && activeObject.type === 'rect') {
        const rect = activeObject as fabric.Rect;
        const startX = rect.left || 0;
        const startY = rect.top || 0;
        
        rect.set({
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
        });
        
        if (pointer.x < startX) rect.set({ left: pointer.x });
        if (pointer.y < startY) rect.set({ top: pointer.y });
      } else if (currentTool === 'circle' && activeObject.type === 'circle') {
        const circle = activeObject as fabric.Circle;
        const startX = circle.left || 0;
        const startY = circle.top || 0;
        
        const radius = Math.sqrt(
          Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
        ) / 2;
        
        circle.set({ radius });
      }
      
      canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
      setIsDrawing(false);
    });

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Show/hide annotations
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type !== 'image') {
        obj.set({ visible: showAnnotations });
      }
    });
    canvas.renderAll();
  }, [showAnnotations]);

  const handleCanvasChange = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Debounce the change event
    setTimeout(() => {
      const annotations = canvas.toJSON();
      onAnnotationChange(annotations);
    }, 100);
  };

  const addRectangle = () => {
    setCurrentTool('rectangle');
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
  };

  const addCircle = () => {
    setCurrentTool('circle');
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
  };

  const addArrow = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const arrow = new fabric.Path('M 0 0 L 30 15 L 20 15 L 20 25 L 0 25 Z', {
      left: 100,
      top: 100,
      fill: '#10b981',
      selectable: true,
      stroke: '#059669',
      strokeWidth: 1,
    });

    canvas.add(arrow);
    handleCanvasChange();
  };

  const enableFreeDrawing = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = !canvas.isDrawingMode;
    canvas.freeDrawingBrush.color = '#f59e0b';
    canvas.freeDrawingBrush.width = 3;
    setCurrentTool('freehand');
  };

  const selectMode = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    setCurrentTool('select');
  };

  const undo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length > 1) { // Keep the background image
      canvas.remove(objects[objects.length - 1]);
      handleCanvasChange();
    }
  };

  const clearAll = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type !== 'image') {
        canvas.remove(obj);
      }
    });
    handleCanvasChange();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
        <button
          onClick={selectMode}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentTool === 'select'
              ? 'bg-primary text-white'
              : 'bg-white text-slate-700 hover:bg-slate-200'
          }`}
        >
          Select
        </button>
        
        <button
          onClick={addRectangle}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentTool === 'rectangle'
              ? 'bg-red-500 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-200'
          }`}
        >
          Rectangle
        </button>
        
        <button
          onClick={addCircle}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentTool === 'circle'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-200'
          }`}
        >
          Circle
        </button>
        
        <button
          onClick={addArrow}
          className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
        >
          Arrow
        </button>
        
        <button
          onClick={enableFreeDrawing}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            currentTool === 'freehand'
              ? 'bg-yellow-500 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-200'
          }`}
        >
          Free Draw
        </button>
        
        <div className="flex-1" />
        
        <button
          onClick={undo}
          className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
        >
          Undo
        </button>
        
        <button
          onClick={clearAll}
          className="px-3 py-2 bg-white text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-slate-600">Loading image...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-75 z-10">
            <div className="text-center p-6 bg-white rounded-lg shadow-md border border-red-200">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <p className="font-medium text-red-800 mb-2">Failed to load image</p>
              <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  // Trigger reload by forcing useEffect
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} />
      </div>

      {/* Instructions */}
      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Instructions:</p>
        <ul className="space-y-1">
          <li>• Select a tool from the toolbar above</li>
          <li>• Click and drag on the image to create annotations</li>
          <li>• Use Select mode to move or resize existing annotations</li>
          <li>• Click "Save Changes" to save your annotations</li>
        </ul>
      </div>
    </div>
  );
}