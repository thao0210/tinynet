import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import classes from '../styles.module.scss';
import { FaDownload, FaSave } from "react-icons/fa";
import ColorOrGradientPicker from "@/components/gradientPicker/colorOrGradientPicker";
import { parseCssGradientToQrGradient } from "@/utils/color";
import Dropdown from "@/components/dropdown";
import classNames from "classnames";

const defaultOptions = {
  width: 250,
  height: 250,
  data: "https://example.com",
  image: "",
  dotsOptions: {
    type: "rounded",
    color: "#000000"
  },
  backgroundOptions: {
    color: "#ffffff"
  },
  cornersSquareOptions: {
    type: "extra-rounded",
    color: "#000000"
  },
  cornersDotOptions: {
    type: "dot",
    color: "#000000"
  }
};

const QRCodeCustomizer = ({ onSaveToEditor }) => {
  const qrCodeRef = useRef(null);
  const containerRef = useRef(null);
  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling(options);
    qrCodeRef.current.append(containerRef.current);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        }
    };
  }, []);

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update(options);
    }
  }, [options]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOptions((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsed = parseInt(value);
    if (name === "width") {
      setOptions((prev) => ({ ...prev, width: parsed || 250, height: parsed || 250 }));
    } else if (name.startsWith("dots_")) {
      setOptions((prev) => ({
        ...prev,
        dotsOptions: {
          ...prev.dotsOptions,
          [name.replace("dots_", "")]: value
        }
      }));
    } else if (name.startsWith("bg_")) {
      setOptions((prev) => ({
        ...prev,
        backgroundOptions: {
          ...prev.backgroundOptions,
          [name.replace("bg_", "")]: value
        }
      }));
    } else if (name.startsWith("cs_")) {
      setOptions((prev) => ({
        ...prev,
        cornersSquareOptions: {
          ...prev.cornersSquareOptions,
          [name.replace("cs_", "")]: value
        }
      }));
    } else if (name.startsWith("cd_")) {
      setOptions((prev) => ({
        ...prev,
        cornersDotOptions: {
          ...prev.cornersDotOptions,
          [name.replace("cd_", "")]: value
        }
      }));
    } else {
      setOptions((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value, name) => {
    setOptions((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          type: value
        }
      }));
  };

  const download = () => {
    qrCodeRef.current.download({ name: "custom-qr", extension: "png" });
  };

    const saveToEditor = async () => {
        try {
            const blob = await qrCodeRef.current.getRawData("png");
            const reader = new FileReader();
            reader.onloadend = () => {
            const base64 = reader.result;
            if (typeof base64 === "string" && base64.startsWith("data:image/png")) {
                onSaveToEditor?.(base64, options.width, options.width); // Gọi lại hàm đưa vào Tiptap
            } else {
                console.error("Not PNG image type:", base64);
                alert("Error: Can't create PNG image from QR Code.");
            }
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu QR:", error);
            alert("Can't create QR Code, Please try again.");
        }
    };

  return (
    <div className={classes.qrCode}>
      <h2>Custom QR Code</h2>
      <div className={classes.content}>
        <div className={classes.form} id="qrCodeContent">
            <div className={classes.inputs}>
                <div>
                    <div>
                        <label>Width</label>
                        <input name="width" type="number" value={options.width} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Data</label>
                        <textarea name="data" value={options.data} onChange={handleChange} rows={4} />
                    </div>
                    <div>
                        <label>Logo</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>
                </div>
                <div>
                    <ColorOrGradientPicker
                      label="Dots Color"
                      value={options.dotsOptions.color}
                      onChange={(val) => {
                        setOptions((prev) => {
                          if (typeof val === "string") {
                            if (/gradient/i.test(val)) {
                              const parsed = parseCssGradientToQrGradient(val);
                              if (parsed) {
                                return {
                                  ...prev,
                                  dotsOptions: {
                                    ...prev.dotsOptions,
                                    color: undefined,
                                    gradient: parsed
                                  }
                                };
                              } else {
                                console.warn("can't parse gradient:", val);
                                return prev;
                              }
                            }

                            // Màu đơn
                            return {
                              ...prev,
                              dotsOptions: {
                                ...prev.dotsOptions,
                                color: val,
                                gradient: undefined
                              }
                            };
                          }
                        });
                      }}
                    />
                    <div>
                        <label> Dots type</label>
                        <Dropdown
                            curValue={options.dotsOptions.type}
                            list={['square', 'dots', 'rounded']}
                            onSelect={handleSelectChange}
                            width={90}
                            name={'dotsOptions'}
                            dropdownContainerSelector='#qrCodeContent'
                        />
                    </div>
                    <div>
                        <label>Background color</label>
                        <input name="bg_color" type="color" value={options.backgroundOptions.color} onChange={handleChange} />
                    </div>
                </div>
                <div>
                    <div>
                        <label>Corner Square Type</label>
                        <Dropdown
                            curValue={options.cornersSquareOptions.type}
                            list={['square', 'extra-rounded', 'dot']}
                            onSelect={handleSelectChange}
                            width={130}
                            name={'cornersSquareOptions'}
                            dropdownContainerSelector='#qrCodeContent'
                        />
                    </div>
                    <div>
                        <label>Color</label>
                        <input name="cs_color" type="color" value={options.cornersSquareOptions.color} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Corner Dot Type</label>
                        <Dropdown
                            curValue={options.cornersDotOptions.type}
                            list={['square', 'dot']}
                            onSelect={handleSelectChange}
                            width={80}
                            name={'cornersDotOptions'}
                            dropdownContainerSelector='#qrCodeContent'
                        />
                    </div>
                    <div>
                        <label>Color: </label>
                        <input name="cd_color" type="color" value={options.cornersDotOptions.color} onChange={handleChange} />
                    </div>
                </div>
            </div>
            <div>
                <button onClick={download} className="btn sub"><FaDownload /> Download png</button>
                <button className="btn" onClick={saveToEditor} style={{ marginLeft: 10 }}>
                <FaSave /> Save to editor
                </button>
            </div>
        </div>
        <div className={classes.review}>
            <h4>QR code Review</h4>
            <div ref={containerRef} />
        </div>
      </div>
    </div>
  );
};

export default QRCodeCustomizer;
