import { FaCircle, FaSquare } from "react-icons/fa";
import { BsFillTriangleFill } from "react-icons/bs";
import { HiMiniPhoto } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { FaPaintBrush, FaTrash, FaRegImage, FaDownload, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import { IoShapesSharp } from "react-icons/io5";
import { IoText } from "react-icons/io5";
import { MdGridOn } from "react-icons/md";
import classes from './styles.module.scss';
import { useEffect, useRef, useState } from "react";
import useClickOutside from '@/hooks/useClickOutsite';
import Dropdown from '@/components/dropdown';
import { hexToRgb } from "@/utils/color";
import classNames from "classnames";
import Checkbox from '@/components/checkbox';
import Tippy from "@tippyjs/react";

const Fonts = ['Arial', 'Roboto', 'Vibur', 'Fredoka', 'Noto Sans', 'Modak', 'Kablammo', 'Mogra', 'Flavors', 'Damion', 'Borel', 'Bowlby One SC', 'Fugaz One', 'Caesar Dressing', 'Croissant One', 'Monoton', 'Changa One', 'Charmonman', 'Fascinate Inline', 'Squada One', 'Butcherman', 'Nosifer', 'Hanalei Fill'];
const Brush = ({prs}) => {
    const {showSubMenus, setShowSubMenus, fabric, canvas, isSelect, setIsSelect, props, setProps, selected, isColoring} = prs;
    const brushRef = useRef();
    const [style, setStyle] = useState('pencil');

    // Hàm đổi type của activeObject
    const handlePath = (newStyle) => {
        if (canvas) {
            let newBrush;
            
            switch (newStyle) {
                case 'pencil':
                    newBrush = new fabric.PencilBrush(canvas);
                    break;
                case 'spray':
                    newBrush = new fabric.SprayBrush(canvas);
                    break;
                case 'pattern':
                    newBrush = new fabric.PatternBrush(canvas);
                    break;
                case 'circle':
                    newBrush = new fabric.CircleBrush(canvas);
                    break;
                default:
                    newBrush = new fabric.PencilBrush(canvas);
            }

            // Chỉ tạo mới, không thay đổi brush của object đã vẽ
            newBrush.color = typeof props.stroke === "string" ? props.stroke : "#000000";
            newBrush.width = props.strokeWidth;
            canvas.freeDrawingBrush = newBrush;
    
            setStyle(newStyle); // Cập nhật state style hiện tại
            canvas.renderAll();
        }
    };    

    useEffect(() => {
        if (!canvas) return;
        
        if (!selected || selected.type !== "path") {
            canvas.isDrawingMode = true;
            setIsSelect(false);
            handlePath(style); // Đảm bảo brush được cập nhật
        }
    }, [canvas, style, props.stroke, props.strokeWidth]);

    const updateSelectedPath = (prop, value) => {
        if (!canvas) return;
    
        // Nếu đang vẽ mới (không có selected object)
        if (!selected) {
            if (canvas.freeDrawingBrush) {
                if (prop === "stroke") {
                    canvas.freeDrawingBrush.color = value; // Cập nhật màu cho brush
                } else if (prop === "strokeWidth") {
                    canvas.freeDrawingBrush.width = value; // Cập nhật độ dày cho brush
                }
            }
        } else {
            // Nếu đang chỉnh sửa object đã vẽ
            let target = selected;
            if (selected.type === "group") {
                if (prop === "strokeWidth") return;

                selected._objects.forEach(obj => {
                    // console.log(obj);
                    if (prop === "stroke") {
                        const oldFill = obj.fill;
                        const oldOpacity = oldFill.match(/rgba?\(\d+,\d+,\d+,([\d.]+)\)/);
                        const opacity = oldOpacity ? parseFloat(oldOpacity[1]) : 1; // Giữ giá trị opacity cũ

                        // Chuyển màu mới thành dạng rgba với opacity cũ
                        const newColor = `rgba(${hexToRgb(value)},${opacity})`;

                        obj.set({ fill: newColor });
                        // obj.set({ fill: value });
                    } else if (prop === "opacity") {
                        obj.set({ opacity: value });
                    }
                });
            } else {
                target.set({ [prop]: value });
            }
        }
    
        canvas.renderAll();
        setProps(prev => ({ ...prev, [prop]: value }));
    };
    
    return (
        <div onClick={() => setShowSubMenus('path')} ref={brushRef} className={showSubMenus==='path' || !isSelect ? classes.active : ''}>
            <Tippy content='Brush'>
                <span>
                    <FaPaintBrush />
                    <IoMdArrowDropright className={classes.arrow}/>
                </span>
            </Tippy>
            {
                (showSubMenus === 'path' || isColoring) &&
                <div className={classes.subMenus}>
                    <span className={classes.close} onClick={(e) => {
                        e.stopPropagation();
                        setShowSubMenus(false)
                        }}>&times;
                    </span>
                    <div>
                        <label>Color</label>
                        <input type="color" value={props.stroke} onChange={(e) => updateSelectedPath("stroke", e.target.value)}/>
                    </div>
                    <div>
                        <label>Opacity</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={props.opacity}
                            onChange={(e) => updateSelectedPath("opacity", e.target.value)}
                        />
                    </div>
                    {
                        (!selected || (selected && selected.type === "path")) &&
                        <div>
                            <label>Width <span>({props.strokeWidth}px)</span></label>
                            
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={props.strokeWidth} 
                                onChange={(e) => updateSelectedPath("strokeWidth", Number(e.target.value))} 
                            />
                            {/* <input type="number" min={1} value={props.strokeWidth} onChange={(e) => updateSelectedPath("strokeWidth", Number(e.target.value))}/> */}
                        </div>
                    }
                    {
                    !selected && !isColoring &&
                    <div>
                        <label>Styles</label>
                        <ul>
                            {
                                ['pencil', 'spray', 'pattern', 'circle'].map((type, index) => (
                                    <li 
                                        key={type} 
                                        onClick={() => handlePath(type)} 
                                        className={classNames({[classes.active]: style === type}, {[classes.disabled]: index > 0})}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    }
                </div>
            }
        </div>
    )
}

export const Text = ({prs}) => {
    const {showSubMenus, setShowSubMenus, fabric, canvas, setIsSelect, props, setProps, selected, setSelected} = prs;
    const textRef = useRef();
    // useClickOutside(textRef, () => showSubMenus === 'text' && setShowSubMenus(null));

    const addText = () => {
        if (!canvas) return;
        canvas.isDrawingMode = false;
        setIsSelect(true);
        const text = new fabric.Textbox("Enter text", {
          left: 200,
          top: 100,
          fontSize: props.fontSize,
          fill: props.color,
          fontFamily: props.fontFamily,
          fontWeight: props.fontWeight,
          textAlign: props.textAlign
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        setSelected(text);
        setShowSubMenus('text');
        canvas.renderAll();
      };

    // Cập nhật thuộc tính text khi props thay đổi
    useEffect(() => {
        if (selected) {
            selected.set({
                fill: props.color,
                fontSize: parseInt(props.fontSize, 10),
                fontFamily: props.fontFamily,
                fontWeight: props.fontWeight,
                opacity: props.opacity,
                textAlign: props.textAlign,
                stroke: props.stroke,
                strokeWidth: props.strokeWidth
            });
            canvas.renderAll();
        }
    }, [props, selected]);

    return (
        <div ref={textRef}>
            <Tippy content='Text'>
                <div onClick={addText}>
                    <IoText/>
                    <IoMdArrowDropright className={classes.arrow}/>
                </div>
            </Tippy>
            {
                showSubMenus === 'text' && selected &&
                <div className={classes.subMenus} id="drawing-subMenus">
                    <span className={classes.close} onClick={(e) => {
                        e.stopPropagation();
                        setShowSubMenus(false)
                        }}>&times;
                    </span>
                    <div>
                        <label>Text Color</label>
                        <input type="color" value={props.color} onChange={(e) => setProps({...props, color: e.target.value})}/>
                    </div>
                    <div>
                        <label>Font Family</label>
                        <Dropdown
                            curValue={props.fontFamily}
                            list={Fonts}
                            onSelect={(item) => setProps({...props, fontFamily: item})}
                            width={120}
                            showFont
                            dropdownContainerSelector='#drawing-subMenus'
                        />
                    </div>
                    <div>
                        <label>Font Size</label>
                        <input type="number" min={5} max={300} value={props.fontSize} onChange={(e) => setProps({...props, fontSize: e.target.value})}/>
                    </div>
                    <div>
                        <label>Alignment</label>
                        <div className={classes.groupSvg}>
                            <FaAlignLeft className={props.textAlign === 'left' ? classes.active : ''} onClick={() => setProps({...props, textAlign: 'left'})} />
                            <FaAlignCenter className={props.textAlign === 'center' ? classes.active : ''} onClick={() => setProps({...props, textAlign: 'center'})} />
                            <FaAlignRight className={props.textAlign === 'right' ? classes.active : ''} onClick={() => setProps({...props, textAlign: 'right'})} />
                        </div>
                    </div>
                    <div>
                        <label>Opacity</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={props.opacity}
                            onChange={(e) => setProps({...props, opacity: e.target.value})}
                        />
                    </div>
                    <div>
                        <label>Stroke Color</label>
                        <input type="color" value={props.stroke} onChange={(e) => setProps({...props, stroke: e.target.value})}/>
                    </div>
                    <div>
                        <label>Stroke Width</label>
                        <input type="number" min={0} value={props.strokeWidth} onChange={(e) => setProps({...props, strokeWidth: Number(e.target.value)})}/>
                    </div>
                </div>
            }
        </div>
    )
}
export const Shapes = ({prs}) => {
    const {showSubMenus, setShowSubMenus, fabric, canvas, setIsSelect, props, setProps, selected, setSelected} = prs;
    const shapeRef = useRef();

    const addShape = (type) => {
        if (!canvas || !fabric) return;
        
        setProps({...props, type: type});
        canvas.isDrawingMode = false;
        setIsSelect(true);
        let newObject;
        switch (type) {
          case "rectangle":
            newObject = new fabric.Rect({
              left: 100,
              top: 100,
              width: 100,
              height: 100,
              fill: props.color,
            });
            break;
          case "circle":
            newObject = new fabric.Circle({
              left: 150,
              top: 150,
              radius: 50,
              fill: props.color,
            });
            break;
          case "triangle":
            newObject = new fabric.Triangle({
              left: 200,
              top: 200,
              width: 100,
              height: 100,
              fill: props.color,
            });
            break;
          default:
            return;
        }
        canvas.add(newObject);
        setShowSubMenus(null);
        canvas.setActiveObject(newObject); // ✅ Set object được chọn sau khi thêm
        canvas.renderAll(); // ✅ Fix canvas không update
      };

    // Cập nhật thuộc tính text khi props thay đổi
    useEffect(() => {
        if (selected) {
            selected.set({
                fill: props.color,
                stroke: props.stroke,
                strokeWidth: props.strokeWidth,
                opacity: props.opacity,

            });
            canvas.renderAll();
        }
    }, [props, selected]);

    return (
        <div onClick={() => setShowSubMenus('shape')} ref={shapeRef} className={showSubMenus==='shape' ? classes.active : ''}>
            <Tippy content='Shape'>
                <span>
                    <IoShapesSharp/>
                    <IoMdArrowDropright className={classes.arrow}/>
                </span>
            </Tippy>
            {
                showSubMenus === 'shape' &&
                <div className={classes.subMenus}>
                    <span className={classes.close} onClick={(e) => {
                        e.stopPropagation();
                        setShowSubMenus(false)
                        }}>&times;
                    </span>
                    <div>
                        <label>Color</label>
                        <input type="color" value={props.color} onChange={(e) => setProps({...props, color: e.target.value})}/>
                    </div>
                    {
                        !selected &&
                        <div>
                            <label>Shapes</label>
                            <ul>
                                <li onClick={(e) => addShape("circle")}><FaCircle /></li>
                                <li onClick={(e) => addShape("rectangle")}><FaSquare /></li>
                                <li onClick={(e) => addShape("triangle")}><BsFillTriangleFill /></li>
                            </ul>
                        </div>
                    }
                    <div>
                        <label>Opacity</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={props.opacity}
                            onChange={(e) => setProps({...props, opacity: e.target.value})}
                        />
                    </div>
                    <div>
                        <label>Stroke Color</label>
                        <input type="color" value={props.stroke} onChange={(e) => setProps({...props, stroke: e.target.value})}/>
                    </div>
                    <div>
                        <label>Stroke Width</label>
                        <input type="number" min={0} value={props.strokeWidth} onChange={(e) => setProps({...props, strokeWidth: Number(e.target.value)})}/>
                    </div>
                </div>
            }
        </div>
    )
}

export const BgImage = ({showSubMenus, setShowSubMenus, canvas, fabric, saveBgData, setSaveBgData, data, setData}) => {
    const imageRef = useRef();
    useClickOutside(imageRef, () => showSubMenus === 'image' && setShowSubMenus(null));
    const [bgOpacity, setBgOpacity] = useState(1);
    const onRemoveBackground = () => {
        if (canvas.backgroundImage) {
        canvas.set("backgroundImage", null);
        canvas.renderAll.bind(canvas);
        }
          canvas.requestRenderAll();
        setData({...data, hasBg: false});
    }
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result).then((img) => {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            img.set({
            selectable: false,
            evented: false,
            opacity: bgOpacity,
            scaleX: scale,
            scaleY: scale,
            left: (canvas.width - img.width * scale) / 2,
            top: (canvas.height - img.height * scale) / 2,
            });
            canvas.set("backgroundImage", img);
            canvas.renderAll.bind(canvas);
            canvas.requestRenderAll();
            setData({...data, hasBg: true});
        });
        };
        reader.readAsDataURL(file);
    };

    const handleOpacityChange = (event) => {
        const opacity = parseFloat(event.target.value);
        setBgOpacity(opacity);
        canvas.backgroundImage.set('opacity', opacity);
        canvas.requestRenderAll();
    };
    return (
        <div onClick={() => setShowSubMenus('image')} ref={imageRef} className={showSubMenus==='image' ? classes.active : ''}>
            <Tippy content='Background Image'>
                <span>
                    <FaRegImage/>
                    <IoMdArrowDropright className={classes.arrow}/>
                </span>
            </Tippy>
            {
            showSubMenus === 'image' &&
            <div className={classes.subMenus}>
                <span className={classes.close} onClick={(e) => {
                        e.stopPropagation();
                        setShowSubMenus(false)
                        }}>&times;
                    </span>
                {
                !data.hasBg &&
                <div className={classes.upload}>
                    <span>Upload Background</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                }
                {
                data.hasBg &&
                    <>
                        <div className={classes.upload}>
                            <HiMiniPhoto size={30} />
                            <span className={classes.close} onClick={onRemoveBackground}><FaTrash size={15} /></span>
                        </div>
                        <div>
                            <label>Background Opacity</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={bgOpacity}
                                onChange={handleOpacityChange}
                            />
                        </div>
                        <Checkbox
                            label={'Include the background image'} 
                            isChecked={saveBgData}
                            setIsChecked={setSaveBgData}
                        />
                    </>
                }
            </div> 
            }
        </div>
    )
}

export const Grid = ({canvas, fabric, gridObject, setGridObject}) => {
    const gridRef = useRef();
    const [showGrid, setShowGrid] = useState(false);    
    useEffect(()=>{
          // Vẽ grid overlay
        const drawGrid = () => {
          const gridSize = 100;
          const gridCanvas = document.createElement("canvas");
          gridCanvas.width = canvas.width;
          gridCanvas.height = canvas.height;
          const ctx = gridCanvas.getContext("2d");
          ctx.strokeStyle = "#ddd";
          for (let i = 0; i < canvas.width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let j = 0; j < canvas.height; j += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
          }
          
          return new fabric.Image(gridCanvas, { selectable: false, evented: false });
          // return gridCanvas.toDataURL();
        };
    
        if (showGrid && canvas) {
          const newGrid = drawGrid();
          setGridObject(newGrid);
          canvas.add(newGrid);
          canvas.renderAll.bind(canvas);
        } else if (gridObject) 
          {
            canvas.remove(gridObject);
            setGridObject(null);
            canvas.renderAll.bind(canvas);
          }
        }, [showGrid]);

    return (
        <div onClick={() => setShowGrid(!showGrid)} className={showGrid ? classes.active : ''} ref={gridRef}>
            <Tippy content='Grid'>
                <span>
                    <MdGridOn/>
                </span>
            </Tippy>
        </div>
    )
}
export const Download = ({showSubMenus, setShowSubMenus, canvas}) => {
    const downloadRef = useRef();
    useClickOutside(downloadRef, () => showSubMenus === 'download' && setShowSubMenus(null));
    const downloadImage = (format) => {
        const dataURL = canvas.toDataURL({ format });
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `canvas.${format}`;
        link.click();
        setShowSubMenus(null);
      };
    
      const downloadVector = () => {
        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "canvas.svg";
        link.click();
        setShowSubMenus(null);
    };
    return (
        <div onClick={() => setShowSubMenus('download')} ref={downloadRef} className={showSubMenus==='download' ? classes.active : ''}>
            <Tippy content='Download'>
                <span>
                    <FaDownload/>
                    <IoMdArrowDropright className={classes.arrow}/>
                </span>
            </Tippy>
            {
                showSubMenus === 'download' &&
                <div className={classes.subMenus}>
                    <span className={classes.close} onClick={(e) => {
                        e.stopPropagation();
                        setShowSubMenus(false)
                        }}>&times;
                    </span>
                    <div>
                    <ul>
                        <li onClick={() => downloadImage("png")}>PNG</li>
                        <li onClick={() => downloadImage("jpg")}>JPG</li>
                        <li onClick={downloadVector}>SVG</li>
                    </ul>
                    </div>
                </div>
            }
        </div>
    )
}

export default Brush;