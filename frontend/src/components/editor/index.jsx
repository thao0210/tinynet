import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Node } from '@tiptap/core';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';
import { FontSize } from './fontSize'; // Import file vừa tạo
// import EmojiPicker from 'emoji-picker-react';
import EmojiPickerLite from '../emojiPicker';
import { FaBold, FaItalic, FaUnderline, FaSmile, FaTable, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaListUl, FaListOl, FaCode, FaQuoteLeft, FaLink, FaMicrophone } from 'react-icons/fa';
import { SwatchesPicker } from 'react-color';
import classes from './styles.module.scss';
import Modal from '@/components/modal';
import Dropdown from '../dropdown';
import { MdFormatColorText } from "react-icons/md";
import Link from '@tiptap/extension-link';
import useClickOutside from '@/hooks/useClickOutsite';
import AddImage from './components/addImage';
import AddVideo from './components/addVideo';
import AddVoice from './components/addVoice';
import CustomResizableImage from './CustomResizableImage';
import classNames from 'classnames';
import DrawingBlock from './drawingBlock';
import { BsQrCode } from "react-icons/bs";
import QRCodeCustomizer from './components/qrCode';
import Tippy from '@tippyjs/react';
import AddTheme from './components/addTheme';
import NewTheme from './components/newTheme';
import { Fonts, FontSizes } from '@/sharedConstants/data';
import AddMusic from './components/addMusic';

const Video = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: { default: true },
      style: { default: 'max-width:500px;width:100%;height:auto;' },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', { ...HTMLAttributes, controls: true }];
  },
});

const TiptapEditor = ({content, setData, data, onContentChange, onTextChange, useSmallText, isContribution}) => {
  const [color, setColor] = useState('#000000');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showSideModal, setShowSideModal] = useState(false);
  const [loadListTheme, setLoadListTheme] = useState(false);
  const [curValues, setCurValues] = useState({
    fontName: 'Roboto',
    fontSize: '16px'
  })

  const sideRef = useRef();
  useClickOutside(sideRef, () => setShowSideModal(false));

  const editor = useEditor({
    extensions: [
      TextStyle,
      StarterKit,
      Color,
      Underline,
      CustomResizableImage,
      Video,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      FontFamily,
      FontSize,
      Placeholder.configure({ placeholder: 'Start typing...' }),
      Table.configure({
        resizable: true, 
        allowTableNodeSelection: true
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: true })
    ],
    
    content: content || '',
    onUpdate: ({ editor }) => {
        if (onContentChange) {
          onContentChange(editor.getHTML());
        }
        if (onTextChange) {
          onTextChange(editor.getText());
        }
      },
  });

  const addEmoji = (emojiObject) => {
    editor.chain().focus().insertContent(emojiObject).run();
  };

  const onFontFamilySelect = (value) => {
    editor.chain().focus().setFontFamily(value).run();
    setCurValues({...curValues, fontName: value});
  }

  const onFontSizeSelect = (value) => {
    editor.chain().focus().setFontSize(value).run();
    setCurValues({...curValues, fontSize: value});
  }

  const handleSaveDrawing = (dataUrl) => {
    editor
      .chain()
      .focus()
      .insertContent({
      type: 'image',
      attrs: {
        src: dataUrl,
        alt: 'drawing'
      }
    })
      .run();
    setShowModal(null);
  };

  const handleSaveToEditor = (base64Image, width, height) => {
    editor.chain().focus().insertContent({
      type: 'image',
      attrs: {
        src: base64Image,
        alt: 'QR Code',
        width: width,
        height: height,
      }
    }).run();
    setShowModal(null);
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className={classes.editor} id='editor'>
      <div className={classes.menus}>
        <Tippy content='bold'>
          <button onClick={() => editor.chain().focus().toggleBold().run()}><FaBold /></button>
        </Tippy>
        <Tippy content='italic'>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}><FaItalic /></button>
        </Tippy>
        <Tippy content='underline'>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}><FaUnderline /></button>
        </Tippy>
          <Dropdown 
              trigger={<Tippy content='Text Color'><span><MdFormatColorText size={18} /></span></Tippy>} 
              className={classes.imagesList} 
              dropdownContainerSelector='#editor'
          >
              <SwatchesPicker color={color} onChangeComplete={(c) => {
                  setColor(c.hex);
                  editor.chain().focus().setColor(c.hex).run();
              }} /> 
          </Dropdown>
        <Dropdown
            curValue={curValues.fontName}
            list={Fonts}
            onSelect={onFontFamilySelect}
            title={'Font Name'}
            showFont
            dropdownContainerSelector='#editor'
            isSmallText={useSmallText}
        />
        <Dropdown
            curValue={curValues.fontSize}
            list={FontSizes}
            onSelect={onFontSizeSelect}
            title='Font Size'
            width={60}
            dropdownContainerSelector='#editor'
            isSmallText={useSmallText}
        />
        <AddImage setError={setError} error={error} editor={editor} />
        <AddVideo setError={setError} error={error} editor={editor} />
        <div>
          <Dropdown 
            trigger={<FaSmile />}
            className={classes.emojiPicker} 
            dropdownContainerSelector='#editor'
            tippy='Emoji Picker'
          >
            <EmojiPickerLite onSelect={addEmoji} className={classes.emojiBox} />
          </Dropdown>
        </div>
        <Tippy content='Table'>
          <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}><FaTable /></button>
        </Tippy>
        <Tippy content='Align Left'>
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()}><FaAlignLeft /></button>
        </Tippy>
        <Tippy content='Align Center'>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()}><FaAlignCenter /></button>
        </Tippy>
        <Tippy content='Align Right'>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()}><FaAlignRight /></button>
        </Tippy>
        <Tippy content='Justify Content'>
          <button onClick={() => editor.chain().focus().setTextAlign('justify').run()}><FaAlignJustify /></button>
        </Tippy>
        <Tippy content='Bullet List'>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
        </Tippy>
        <Tippy content='Ordered List'>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()}><FaListOl /></button>
        </Tippy>
        <Tippy content='Code Block'>
          <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}><FaCode /></button>
        </Tippy>
        <Tippy content='Block Quote'>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()}><FaQuoteLeft /></button>
        </Tippy>
        <Tippy content='Link'>
          <button onClick={() => {
            const url = prompt('Enter URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}><FaLink /></button>
        </Tippy>
        <Tippy content='Draw/Sign'>
            <button onClick={() => setShowModal('draw')}><img src='/drawing.png' height={18} alt='sign' /></button>
        </Tippy>
        <Tippy content='Qr code'>
          <button onClick={() => setShowModal('qr')}><BsQrCode size={16} /></button>
        </Tippy>
        <AddVoice editor={editor} />
        {
          !isContribution &&
          <>
            <AddMusic setData={setData} />
            <AddTheme setData={setData} data={data} showThemes={showThemes} setShowThemes={setShowThemes} setShowSideModal={setShowSideModal} loadListTheme={loadListTheme} setLoadListTheme={setLoadListTheme} />
          </>
        }
      </div>
      
      <EditorContent editor={editor} className={classNames(classes.content)} />
      {
        showModal &&
        <Modal width={showModal === 'qr' ? 800 : 550} height={'auto'} setShowModal={setShowModal}>
          {
            showModal === 'draw' &&
            <DrawingBlock onSave={handleSaveDrawing} />
          }
          {
            showModal === 'qr' &&
            <QRCodeCustomizer onSaveToEditor={handleSaveToEditor} />
          }
        </Modal>
      }
      {
        showSideModal &&
        <div className={classes.sideModal} ref={sideRef}>
          <NewTheme setShowThemes={setShowThemes} setShowSideModal={setShowSideModal} setData={setData} setLoadListTheme={setLoadListTheme}/>
        </div>
      }
    </div>
  );
};

export default TiptapEditor;
