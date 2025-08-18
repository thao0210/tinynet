import { Rnd } from "react-rnd";
import Tippy from "@tippyjs/react";
import { Fonts, FontSizes } from "@/sharedConstants/data";
import Dropdown from '@/components/dropdown';
import classes from './styles.module.scss';
import { FaAlignCenter, FaAlignLeft, FaAlignRight, FaSmile } from "react-icons/fa";
import { CgSandClock } from "react-icons/cg";
import { RiShadowLine } from "react-icons/ri";
import { MdFilterFrames } from "react-icons/md";
import { generateCartoonShadow, generateRainboxShadow } from "@/utils/color";
import { TEXT_SHADOWS } from "@/sharedConstants/data";
import FrameOptionsForm from "./TextBoxFrame";
import SpeechBubble from "@/components/speechBubble";
import EmojiPickerLite from "@/components/emojiPicker";
// import EmojiPicker from "emoji-picker-react";

const TEXT_EFFECTS = ['none', 'typing', 'zoom', 'dancing', 'bounce', 'wave', 'shock', 'explode', 'spider'];

const ScreenTextBox = ({box, activeIndex, index, boxRefs, updateTextbox, deleteTextbox, setActiveIndex, screen, cardTextContent, currentLang}) => {
    const text = cardTextContent?.[currentLang]?.[box.id] || "";
    const addEmoji = (emojiObject) => {
        updateTextbox(box.id, { text: box.text + emojiObject }, currentLang);
    }
    const renderEditableBox = () => (
        <div
            ref={(el) => (boxRefs.current[index] = el)}
            contentEditable
            suppressContentEditableWarning
            onFocus={(e) => {
            if (box.text === 'Your text here') {
                const range = document.createRange();
                range.selectNodeContents(e.target);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            }}
            onBlur={(e) => {
                updateTextbox(box.id, { text: e.target.innerText }, currentLang);
            }}
            onInput={(e) => {
                requestAnimationFrame(() => {
                    const newHeight = e.target.scrollHeight;
                    updateTextbox(box.id, { height: newHeight }, currentLang);
                });
            }}
            onKeyDown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                const selection = window.getSelection();
                if (!selection || !selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode('\n');

                range.insertNode(textNode);

                // Move cursor after new line
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                // Gọi lại update height (optional nếu cần realtime)
                const newHeight = e.currentTarget.scrollHeight;
                updateTextbox(box.id, { height: newHeight }, currentLang);
            }
            }}
            className={classes.textboxContent}
            style={{
            fontSize: box.fontSize,
            fontFamily: box.fontFamily,
            textAlign: box.textAlign,
            color: box.color,
            textShadow:
                box.textShadow === 'rainbow'
                ? generateRainboxShadow(box.fontSize)
                : box.textShadow === 'cartoon'
                ? generateCartoonShadow(box.fontSize)
                : box.textShadow || 'none',
            }}
        >
            {text}
        </div>
        );

    return (
        <Rnd
            size={{ width: box.width }}
            position={{ x: window.innerWidth / 2 + (box.offsetX ?? (-(box.width)/2)), y: window.innerHeight / 2 + (box.offsetY ?? (-(box.height/2))) }}
            onDragStop={(e, d) => {
                const offsetX = d.x - window.innerWidth / 2;
                const offsetY = d.y - window.innerHeight / 2;
                updateTextbox(box.id, { 
                    x: d.x, 
                    y: d.y, 
                    offsetX, 
                    offsetY 
                }, currentLang);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const offsetX = position.x - window.innerWidth / 2;
                const offsetY = position.y - window.innerHeight / 2;
                updateTextbox(box.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    x: position.x,
                    y: position.y,
                    offsetX,
                    offsetY,
                }, currentLang);
            }}
            onClick={() => setActiveIndex(index)}
            bounds="parent"
            className={`${classes.textboxContainer} ${activeIndex === index ? classes.active : classes.inactive}`}
            dragHandleClassName={`drag-handle-${index}`}
        >
            <Tippy content="hold to drag">
            <div
                className={`drag-handle-${index} ${classes.dragHandle}`}
            />
            </Tippy>
            {
                box?.frame?.type ?
                <SpeechBubble
                    type={box.frame.type || 'speech'}
                    shape={box.frame.shape || 'rounded'}
                    fill={box.frame.fill || '#DDD'}
                    strokeColor={box.frame.strokeColor}
                    direction={box.frame.direction}
                    opacity={box.frame.opacity}
                >{renderEditableBox()}</SpeechBubble> :
                renderEditableBox()
            }
            <span
                onClick={() => deleteTextbox(index)}
                className={classes.deleteButton}
            >
                ×
            </span>
            {activeIndex === index && (
                <div className={classes.textMenu}>
                    <div>
                        <Dropdown
                            curValue={box.fontFamily}
                            list={Fonts}
                            onSelect={(font) => updateTextbox(box.id, { fontFamily: font }, currentLang)}
                            showFont
                            dropdownContainerSelector='#item-card'
                            tippy='Font Name'
                            isSmallText
                        />
                    </div>
                    <div>
                    <Dropdown
                        curValue={box.fontSize}
                        list={FontSizes}
                        onSelect={(fontSize) => updateTextbox(box.id, { fontSize: fontSize }, currentLang)}
                        width={60}
                        dropdownContainerSelector='#item-card'
                        tippy='Font Size'
                        isSmallText
                    />
                    </div>
                    <div>
                    <Dropdown
                        curValue={box.textAlign}
                        list={[
                            { value: 'left', label: <FaAlignLeft size={15} /> },
                            { value: 'center', label: <FaAlignCenter size={15} /> },
                            { value: 'right', label: <FaAlignRight size={15} /> },
                        ]}
                        onSelect={(textAlign) => updateTextbox(box.id, { textAlign: textAlign }, currentLang)}
                        width={43}
                        dropdownContainerSelector='#item-card'
                        tippy='Alignment'
                        isSmallText
                    />
                    </div>
                    <div>
                        <Tippy content='Text color'>
                        <input type="color" value={box.color} onChange={e => updateTextbox(box.id, { color: e.target.value }, currentLang)} />
                        </Tippy>
                    </div>
                    <Dropdown
                        trigger={<span><RiShadowLine size={15} /></span>}
                        dropdownContainerSelector='#item-card'
                        tippy='Text shadow'
                        list={TEXT_SHADOWS}
                        onSelect={(textShadow) => updateTextbox(box.id, { textShadow: textShadow }, currentLang)}
                        keepTrigger
                        isSmallText
                    />
                    <div>
                        <Dropdown
                        trigger={<span><FaSmile className={classes.emoji}/></span>}
                        dropdownContainerSelector='#item-card'
                        tippy='Emoji'
                        >
                            <EmojiPickerLite onSelect={addEmoji} className={classes.emojiBox} />
                        </Dropdown>
                    </div>                   
                    <Dropdown
                        trigger={<span><CgSandClock size={15}/> {box.delay || 0}s</span>}
                        dropdownContainerSelector='#item-card'
                        tippy='Delay'
                    >
                    <label>Delay ({box.delay}s)</label>
                    <input type="range" value={box.delay || 0} max={screen?.time - 1} min={0} onChange={(e) => updateTextbox(box.id, {delay: e.target.value}, currentLang)} />
                    </Dropdown>
                    <Dropdown
                        curValue={box.effect}
                        list={TEXT_EFFECTS}
                        onSelect={(effect) => updateTextbox(box.id, { effect: effect }, currentLang)}
                        dropdownContainerSelector='#item-card'
                        tippy='Text Effect'
                        isSmallText
                    />
                    <Dropdown
                        trigger={<span><MdFilterFrames size={16} /></span>}
                        dropdownContainerSelector='#item-card'
                        tippy='Box Frame'
                        width={250}
                    >
                        <FrameOptionsForm 
                           frameOptions={box.frame}
                            onChange={(change) =>
                                updateTextbox(box.id, {
                                    frame: {
                                        ...box.frame,
                                        ...change
                                    }
                                }, currentLang)
                            }
                        />
                    </Dropdown>
                </div>
            )}
        </Rnd>
    )
}

export default ScreenTextBox;