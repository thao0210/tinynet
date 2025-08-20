import { NodeViewWrapper } from '@tiptap/react';
import { Resizable } from 're-resizable';
import React, { useState } from 'react'
import './ResizableImage.css';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaRegCircle } from "react-icons/fa";
import { AiOutlineBorder } from "react-icons/ai";
import { RiShadowLine } from "react-icons/ri";

export default function ResizableImageComponent({ node, updateAttributes, selected, getPos, editor }) {
  const { src, alt, width, height, style = '' } = node.attrs
  const [showTypeBelow, setShowTypeBelow] = useState(true);
  const allStyleObj = parseStyleString(style)

  // Tách style cho wrapper và img
  const wrapperStyleKeys = ['float', 'display', 'margin']
  const imgStyleKeys = ['border', 'border-radius', 'padding', 'box-shadow', 'filter', 'opacity', 'object-fit']

  const wrapperStyles = Object.fromEntries(
    Object.entries(allStyleObj).filter(([key]) => wrapperStyleKeys.includes(key))
  )
  const imgStyles = Object.fromEntries(
    Object.entries(allStyleObj).filter(([key]) => imgStyleKeys.includes(key))
  )

  const handleResizeStop = (e, direction, ref, d) => {
    // console.log('RESIZE STOP', ref.offsetWidth, ref.offsetHeight);
    const styleObj = parseStyleString(node.attrs.style || '');

    // ❌ Xoá width/height trong style cũ nếu có
    delete styleObj.width;
    delete styleObj.height;
    updateAttributes({
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
      // width: ref.offsetWidth,
      // height: ref.offsetHeight,
      style: stringifyStyle(styleObj),
    })
  }

  const toggleStyle = (key, value, isAlign = false) => {
    const styleObj = parseStyleString(style)

    if (isAlign) {
      delete styleObj['float']
      delete styleObj['display']
      delete styleObj['margin']
    }

    if (styleObj[key]?.trim() === value.trim()) {
      delete styleObj[key]
    } else {
      styleObj[key] = value
    }

    updateAttributes({
      style: stringifyStyle(styleObj),
    })
  }

  const toggleMultipleStyles = (newStyles) => {
    const styleObj = parseStyleString(style)

    Object.entries(newStyles).forEach(([key, value]) => {
      if (styleObj[key]?.trim() === value.trim()) {
        delete styleObj[key]
      } else {
        styleObj[key] = value
      }
    })

    updateAttributes({ style: stringifyStyle(styleObj) })
  }

  const insertBelow = () => {
    const pos = typeof getPos === 'function' ? getPos() : null
    if (typeof pos === 'number') {
      const after = pos + node.nodeSize
      editor
        .chain()
        .insertContentAt(after, { type: 'paragraph' })
        .setTextSelection(after + 1)
        .focus()
        .run()
    }
    setShowTypeBelow(false);
  }

  const setAlign = (type) => {
    const styleObj = parseStyleString(style)

    // reset align styles
    delete styleObj.float
    delete styleObj.display
    delete styleObj.margin

    if (type === 'left') {
      styleObj.float = 'left'
    }
    if (type === 'right') {
      styleObj.float = 'right'
    }
    if (type === 'center') {
      styleObj.display = 'block'
      styleObj.margin = '0 auto'
    }

    updateAttributes({ style: stringifyStyle(styleObj) })
  }


  return (
    <NodeViewWrapper
      className="resizable-image-wrapper"
      style={{
        position: 'relative',
        width: width || 'fit-content',
        // display: 'inline-block',
        ...wrapperStyles,
      }}
    >
      {selected && (
        <div className="image-toolbar">
          <button onClick={() => setAlign('left')}><FaAlignLeft /></button>
          <button onClick={() => setAlign('center')}><FaAlignCenter /></button>
          <button onClick={() => setAlign('right')}><FaAlignRight /></button>
          <button onClick={() => toggleMultipleStyles({
            border: '5px solid white',
            'border-radius': '20px',
          })}><AiOutlineBorder /></button>
          <button onClick={() => toggleMultipleStyles({
            border: '5px solid white',
            'border-radius': '50%',
          })}><FaRegCircle /></button>
          <button onClick={() => toggleStyle('box-shadow', '0 2px 5px rgba(0,0,0,0.4)')}>
            <RiShadowLine />
          </button>
        </div>
      )}

      <Resizable
        size={{
          width: width || 'auto',
          height: height || 'auto',
        }}
        onResizeStop={handleResizeStop}
        style={{
          border: selected ? '1px dashed #3b82f6' : 'none',
          boxShadow: selected ? '0 0 4px rgba(59, 130, 246, 0.5)' : 'none',
        }}
        minWidth={150}
        // maxWidth="100%"
        lockAspectRatio
        enable={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            ...imgStyles,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </Resizable>
      {
        showTypeBelow &&
        <div
          className="type-below"
          onClick={insertBelow}
          style={{ minHeight: 30, cursor: 'text' }}
        />
      }
      
    </NodeViewWrapper>
  )
}

// String -> Object
function parseStyleString(styleStr = '') {
  return styleStr.split(';').reduce((acc, line) => {
    const [key, value] = line.split(':').map(part => part?.trim())
    if (key && value) acc[key] = value
    return acc
  }, {})
}

// Object -> String
function stringifyStyle(styleObj) {
  return Object.entries(styleObj)
    .map(([key, val]) => `${key}: ${val}`)
    .join('; ')
}