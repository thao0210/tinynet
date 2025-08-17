import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import classes from './styles.module.scss';
import DrawingMenus from "./drawingMenus";
import classNames from 'classnames';
import Modal from '@/components/modal';

const baseUrl = import.meta.env.VITE_R2_BASE_URL;
// const coloringImages = Array.from({ length: 18 }, (_, i) =>
//   `${baseUrl}/coloring/coloring${i + 1}.avif`
// );

const coloringImages = Array.from({ length: 18 }, (_, i) =>
  `/colorings/coloring${i + 1}.avif`
);

async function trimCanvas(canvas) {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error("trimCanvas: Invalid canvas element");
    return null;
  }

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h).data;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const index = (y * w + x) * 4;
      if (imgData[index + 3] > 0) { 
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === 0 && maxY === 0) {
    console.warn("trimCanvas: No non-transparent pixels found");
    return null;
  }

  const newW = maxX - minX + 1;
  const newH = maxY - minY + 1;

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = newW;
  trimmedCanvas.height = newH;
  const trimmedCtx = trimmedCanvas.getContext("2d");

  // 🔥 Fix lỗi: Kiểm tra nếu dữ liệu hình ảnh hợp lệ trước khi vẽ
  if (newW > 0 && newH > 0) {
    trimmedCtx.drawImage(canvas, minX, minY, newW, newH, 0, 0, newW, newH);
  } else {
    console.error("trimCanvas: Invalid crop dimensions");
    return null;
  }

  return trimmedCanvas;
}


const Draco = ({data, setData, onNext, curItemId, saveBgData, setSaveBgData}) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [gridObject, setGridObject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coloringImage, setColoringImage] = useState(null);
  const [showSubModal, setShowSubModal] = useState(() => (curItemId || data.savedPaths || data.coloringImage) ? null : 'draco');

  useEffect(() => {
    if (!canvasRef.current || canvas) return;

    if (!canvas) {
      const width = window.innerWidth - 86;
      const height = window.innerHeight - 34;
      
      const newCanvas = new fabric.Canvas(canvasRef.current);
      // canvasInstance.current = newCanvas; // ✅ Lưu vào ref thay vì setState
      setCanvas(newCanvas);
  
      fabric.InteractiveFabricObject.ownDefaults = {
        ...fabric.InteractiveFabricObject.ownDefaults,
        cornerStrokeColor: 'blue',
        cornerColor: 'lightblue',
        cornerStyle: 'circle',
        padding: 10,
        transparentCorners: false,
        // cornerDashArray: [2, 2],
        borderColor: 'blue',
        borderDashArray: [5,5],
        borderScaleFactor: 2,
    }

      newCanvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = newCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.3) zoom = 0.3;
        newCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
  
      newCanvas.on("mouse:down", function (opt) {
        if (opt.e.code === "Space") {
          newCanvas.isDragging = true;
          newCanvas.selection = false;
          newCanvas.lastPosX = opt.e.clientX;
          newCanvas.lastPosY = opt.e.clientY;
        }
      });
  
      newCanvas.on("mouse:move", function (opt) {
        if (newCanvas.isDragging) {
          var e = opt.e;
          var vpt = newCanvas.viewportTransform;
          vpt[4] += e.clientX - newCanvas.lastPosX;
          vpt[5] += e.clientY - newCanvas.lastPosY;
          newCanvas.requestRenderAll();
          newCanvas.lastPosX = e.clientX;
          newCanvas.lastPosY = e.clientY;
        }

        // 👇 Brush preview (vòng tròn mô phỏng độ dày)
        const previewEl = document.getElementById("brush-preview");
        if (previewEl) {
          const pointer = newCanvas.getPointer(opt.e);
          const brushSize = newCanvas.freeDrawingBrush?.width || 5; // mặc định 10 nếu chưa set
          const brushColor = newCanvas.freeDrawingBrush?.color || "rgba(0,0,0,0.1)";
          const zoom = newCanvas.getZoom();
          const displaySize = brushSize * zoom;

          previewEl.style.width = `${displaySize}px`;
          previewEl.style.height = `${displaySize}px`;
          previewEl.style.border = "1px solid rgba(0,0,0,0.6)";
          previewEl.style.borderRadius = "50%";
          previewEl.style.position = "absolute";
          previewEl.style.left = `${opt.e.clientX}px`;
          previewEl.style.top = `${opt.e.clientY}px`;
          previewEl.style.pointerEvents = "none";
          previewEl.style.zIndex = "999";
          previewEl.style.background = brushColor;
        }
      });
  
      newCanvas.on("mouse:up", function () {
        newCanvas.setViewportTransform(newCanvas.viewportTransform);
        newCanvas.isDragging = false;
        newCanvas.selection = true;
      });

      newCanvas.on("mouse:out", () => {
        const previewEl = document.getElementById("brush-preview");
        if (previewEl) previewEl.style.display = "none";
      });
      newCanvas.on("mouse:over", () => {
        const previewEl = document.getElementById("brush-preview");
        if (previewEl) previewEl.style.display = "block";
      });
  
      const resizeCanvas = () => {
          if (!newCanvas.lowerCanvasEl) return; // Đảm bảo canvas đã mount
          newCanvas.setWidth(width);
          newCanvas.setHeight(height);
          newCanvas.renderAll();
      };
      // Set kích thước ban đầu
      resizeCanvas();
      
      // setCanvas(newCanvas);
      // Cập nhật kích thước khi resize cửa sổ
      window.addEventListener("resize", resizeCanvas);
      // setLoading(false);
      return () => {
          newCanvas.dispose();
          window.removeEventListener("resize", resizeCanvas);
          setCanvas(null);
          // setLoading(false);
      };
    }
  }, []);

  useEffect(() => {
    if (!canvas) return;
    setLoading(true);
    
    const restorePaths = (done) => {
      if (data?.savedPaths) {
        
        const saved = data.savedPaths;

        const loadCanvasFromJSON = (json) => {
          requestAnimationFrame(() => {
            canvas.loadFromJSON(json, () => {
              canvas.viewportTransform[4] += 0.1;
              canvas.setViewportTransform(canvas.viewportTransform);
              canvas.calcOffset();

              const dummy = new fabric.Rect({
                left: -9999, top: -9999, width: 10, height: 10,
                fill: 'transparent', selectable: false
              });
              canvas.add(dummy);
              canvas.renderAll();

              setTimeout(() => {
                canvas.remove(dummy);
                canvas.renderAll();
                canvas.requestRenderAll();
                setLoading(false);
              }, 50);
            });
          });
        };

        if (typeof saved === 'string') {
          // Là URL → fetch
          fetch(saved)
            .then((res) => res.json())
            .then((json) => loadCanvasFromJSON(json))
            .catch((err) => {
              console.error('Error loading canvas JSON from URL:', err);
              setLoading(false);
            });
        } else {
          // Là JSON object → dùng trực tiếp
          loadCanvasFromJSON(saved);
        }

      } else {
          done && done();
      }
    };

    restorePaths(() => {
      if (data?.coloringImage) {
        choosingImage(data.coloringImage);
      }
      setLoading(false);
    });

  }, [canvas]);

  const onKeyPress = (e) => {
    if (e.key === 'Backspace' || e.keyCode === 8) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
      }
    }
  }

  const onNextClick = () => {
    onSave(true);
    onNext();
  }

  const onSave = async (save) => {
    if (!canvas) return;
    
    if (save) {
      if (data && data.hasBg && !saveBgData && !data.coloringImage) {
        canvas.set("backgroundImage", null);
      }
      gridObject && canvas.remove(gridObject);
      // const json = JSON.stringify(canvas.toJSON());
      const json = canvas.toJSON();

      canvas.renderAll()
      // 🔥 Lấy thẻ <canvas> thực tế từ Fabric.js
      const rawCanvas = canvas.toCanvasElement ? canvas.toCanvasElement() : canvas.getElement();
      
      if (!rawCanvas || !(rawCanvas instanceof HTMLCanvasElement)) {
        console.error("onSave: Failed to get raw HTMLCanvasElement from Fabric.js");
        return;
      }
        let dataURL;
        const trimmedCanvas = await trimCanvas(rawCanvas);

        if (!trimmedCanvas) {
          console.error("Trimming failed or empty canvas");
          return;
        }

        if (!(trimmedCanvas instanceof HTMLCanvasElement)) {
          console.error("onSave: Trimmed canvas is not a valid HTMLCanvasElement");
          return;
        }
        dataURL = trimmedCanvas.toDataURL("image/png", 0.85);
      
       // 🔥 Kiểm tra trimmedCanvas có phải HTMLCanvasElement không
  
      setData({...data, savedPaths: json, base64: dataURL});
    }
  }

  const choosingImage = (image) => {
    setColoringImage(image);
    setData({...data, coloringImage: image});

    fabric.Image.fromURL(image).then((img) => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        img.set({
        selectable: false,
        evented: false,
        scaleX: scale,
        scaleY: scale,
        left: (canvas.width - img.width * scale) / 2,
        top: (canvas.height - img.height * scale) / 2,
      });
      canvas.set("backgroundImage", img);
      canvas.renderAll.bind(canvas);
      canvas.requestRenderAll();
      // canvas.renderAll();
    }, { crossOrigin: "anonymous" });
  }

  return (
    <div className={classes.drawing} id="drawingBoard">
      <div className={classNames(classes.board, classes.expand)}>
        <div className={classNames(classes.dboard, {[classes.imageOnly]: curItemId && !data.canEdit && data.imageUrl})} onKeyDown={onKeyPress} tabIndex={0}>
            <button className={`btn ${classes.next}`} onClick={onNextClick}>Next</button>
              {
                ((curItemId && data.canEdit) || !curItemId) &&
                <DrawingMenus 
                  canvas={canvas} 
                  fabric={fabric} 
                  data={data} 
                  setData={setData} 
                  // setHasBgImage={setHasBgImage}
                  gridObject={gridObject}
                  setGridObject={setGridObject}
                  isColoring={coloringImage}
                  saveBgData={saveBgData}
                  setSaveBgData={setSaveBgData}
                />
              }
              {
                curItemId && !data.canEdit && data.imageUrl &&
                <img src={data.imageUrl} />
              }
            <canvas ref={canvasRef}></canvas>
            <div id="brush-preview"></div>
        </div>
        {
          !coloringImage && !curItemId && showSubModal === 'coloring' &&
          <Modal width={800} setShowModal={setShowSubModal}>
            <div className={classes.coloringList}>
              <h2>Select an image to color</h2>
              <div>
                {coloringImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Coloring ${index + 1}`}
                    height={200}
                    onClick={() => choosingImage(src)}
                  />
                ))}
              </div>
            </div>
          </Modal>
        }
        {
          showSubModal==='draco' &&
          <Modal width={400} setShowModal={setShowSubModal}>
            <div className={classes.coloringList}>
              <h2>Select your choice</h2>
              <div className={classes.selectDraco}>
                <div onClick={() => setShowSubModal(null)}>
                  <img src='/image1.jpg' alt='drawing' height={50} /> <br/>
                  Draw a new picture
                </div>
                <div onClick={() => setShowSubModal('coloring')}>
                   <img src='/image2.jpg' alt='drawing' height={50} /><br/>
                  Color a picture
                </div>
              </div>
            </div>
          </Modal>
        }
      </div>
      </div>
  );
}

export default Draco;