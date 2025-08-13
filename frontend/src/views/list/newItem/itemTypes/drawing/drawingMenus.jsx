import classes from './styles.module.scss';
import { FaUndo, FaRedo, FaSave, FaEraser, FaTrash } from "react-icons/fa";
import { GrSelect } from "react-icons/gr";
import { LuZoomOut, LuZoomIn } from "react-icons/lu";
import { useEffect, useState } from 'react';
import Brush, { BgImage, Download, Grid, Shapes, Text } from './menuItems';
import Tippy from '@tippyjs/react';


const DrawingMenus = ({canvas, fabric, setHasBgImage, gridObject, setGridObject, isColoring, saveBgData, setSaveBgData, data, setData}) => {
    const [isSelect, setIsSelect] = useState(true);
    const [redoStack, setRedoStack] = useState([]);
    const [selectedText, setSelectedText] = useState(null);
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedShape, setSelectedShape] = useState();
    const [textProps, setTextProps] = useState({
      fontSize: 20,
      fill: '#000000',
      fontFamily: 'Arial',
      fontWeight: 'normal',
      textAlign: 'left'
    });
    const [pathProps, setPathProps] = useState({
      stroke: '#000000',
      opacity: 1,
      strokeWidth: 5
    });
    const [shapeProps, setShapeProps] = useState({
      color: '#000000'
    });
    const [showSubMenus, setShowSubMenus] = useState(null);
    const canvasProps = {
      isSelect,
      setIsSelect,
      showSubMenus,
      setShowSubMenus,
      fabric,
      canvas,
    };
    const selectionProps = {
      path: {
        props: pathProps,
        setProps: setPathProps,
        selected: selectedPath,
        setSelected: setSelectedPath
      },
      text: {
        props: textProps,
        setProps: setTextProps,
        selected: selectedText,
        setSelected: setSelectedText,
      },
      shape: {
        props: shapeProps,
        setProps: setShapeProps,
        selected: selectedShape,
        setSelected: setSelectedShape,
      },
    };
    
    const deleteObject = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
      }
    };
  
    const clearCanvas = () => {
      canvas && canvas.clear();
    };

    const onSelect = () => {
      canvas.isDrawingMode = false;
      setIsSelect(true);
      // setActiveB((prev) => prev.filter(item => item !== 'brush').includes('select') ? [...prev] : [...prev, 'select']);
    }
    
    // const saveCanvas = () => {
    //   const json = JSON.stringify(canvas.toJSON());
    //   setData({...data, drawing: json});
    // };
  
    const undo = () => {
      if (canvas._objects.length > 0) {
        setRedoStack([...redoStack, canvas._objects.pop()]);
        canvas.renderAll();
      }
    };
  
    const redo = () => {
      if (redoStack.length > 0) {
        canvas.add(redoStack.pop());
        canvas.renderAll();
      }
    };
  
    const zoomIn = () => {
      canvas.setZoom(canvas.getZoom() * 1.1);
    };
  
    const zoomOut = () => {
      canvas.setZoom(canvas.getZoom() * 0.9);
    };

    useEffect(() => {
      const onSelection = () => {
          let activeObject = canvas.getActiveObject();
  
          if (activeObject) {
              const commonProps = {
                  color: activeObject.fill || "#000000",
                  stroke: typeof activeObject.stroke === "string" ? activeObject.stroke : "#000000",
                  strokeWidth: activeObject.strokeWidth || 1,
                  opacity: activeObject.opacity || 1,
                  angle: activeObject.angle || 0,
                  scaleX: activeObject.scaleX || 1,
                  scaleY: activeObject.scaleY || 1,
              };
  
              if (activeObject.type === "textbox") {
                  setShowSubMenus("text");
                  setSelectedText(activeObject);
                  setTextProps({
                      ...commonProps,
                      fontSize: activeObject.fontSize || 20,
                      fontFamily: activeObject.fontFamily || "Arial",
                      fontWeight: activeObject.fontWeight || "normal",
                      textAlign: activeObject.textAlign || 'left',
                      stroke: activeObject.stroke || null
                  });
              } else if (["rect", "circle", "triangle"].includes(activeObject.type)) {
                  setShowSubMenus("shape");
                  setSelectedShape(activeObject);
                  setShapeProps({
                      ...commonProps,
                      width: activeObject.width || 100,
                      height: activeObject.height || 100,
                      radius: activeObject.radius || 50, // Chỉ dùng cho circle
                      stroke: activeObject.stroke || null
                  });
              } else if (["path", "group"].includes(activeObject.type)) {
                  let brushType = activeObject.brushType || "pencil";
                  let stroke = activeObject.stroke || "#000000";
                  let strokeWidth = activeObject.strokeWidth || 1;
  
                  // Nếu là PatternBrush thì fill mới là màu chính
                  if (brushType === "pattern") {
                      stroke = activeObject.fill || "#000000";
                      strokeWidth = null; // Không áp dụng strokeWidth cho pattern
                  }
  
                  // Nếu là group, lấy strokeWidth của phần tử đầu tiên (nếu có)
                  if (activeObject.type === "group" && activeObject._objects?.length > 0) {
                      strokeWidth = activeObject._objects[0]?.strokeWidth || 1;
                  }
  
                  setShowSubMenus("path");
                  setSelectedPath(activeObject);
                  setPathProps({
                      ...commonProps,
                      brushType,
                      stroke,
                      strokeWidth,
                  });
              } else {
                  setShowSubMenus(null);
                  setSelectedText(null);
                  setSelectedShape(null);
                  setSelectedPath(null);
              }
          } else {
              setShowSubMenus(null);
              setSelectedText(null);
              setSelectedShape(null);
              setSelectedPath(null);
          }
      };
  
      canvas?.on("selection:created", onSelection);
      canvas?.on("selection:updated", onSelection);
      canvas?.on("selection:cleared", () => {
          setShowSubMenus(null);
          setSelectedText(null);
          setSelectedShape(null);
          setSelectedPath(null);
      });
  
      return () => {
          canvas?.off("selection:created", onSelection);
          canvas?.off("selection:updated", onSelection);
          canvas?.off("selection:cleared", () => {
              setShowSubMenus(null);
              setSelectedText(null);
              setSelectedShape(null);
              setSelectedPath(null);
          });
      };
  }, [canvas]);
  
    return (
        <div className={classes.menus} tabIndex="0">
            <Tippy content='Select'>
              <div onClick={onSelect} className={isSelect ? classes.active : ''}><GrSelect/></div>
            </Tippy>            
            <Brush prs={{ ...canvasProps, ...selectionProps.path, isColoring }} />
            {
              !isColoring &&
              <>
                <Text prs={{ ...canvasProps, ...selectionProps.text }}/>
                <Shapes prs={{ ...canvasProps, ...selectionProps.shape }}/>
              </>
            }
            <Tippy content='Delete'>
              <div onClick={deleteObject}><FaTrash/></div>
            </Tippy>
            <Tippy content='Clear All'>
              <div onClick={clearCanvas}><FaEraser/></div>
            </Tippy>
            
            {
              !isColoring &&
              <BgImage {...canvasProps} setHasBgImage={setHasBgImage} saveBgData={saveBgData} setSaveBgData={setSaveBgData} data={data} setData={setData} />
            }
            <Grid {...canvasProps} gridObject={gridObject} setGridObject={setGridObject} />
            <Tippy content='undo'>
              <div onClick={undo}><FaUndo/></div>
            </Tippy>
            <Tippy content='Redo'>
              <div onClick={redo}><FaRedo/></div>
            </Tippy>
            <Tippy content='Zoom In'>
              <div onClick={zoomIn}><LuZoomIn/></div>
            </Tippy>
            <Tippy content='Zoom Out'>
              <div onClick={zoomOut}><LuZoomOut/></div>
            </Tippy> 
            <Download {...canvasProps} />
            {/* <div onClick={saveCanvas}><FaSave/></div> */}
        </div>
    )
}

export default DrawingMenus;