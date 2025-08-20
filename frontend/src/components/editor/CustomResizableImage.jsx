import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImageComponent from './ResizableImageComponent'

const CustomResizableImage = Node.create({
  name: 'image',
  group: 'block',
  draggable: true,
  selectable: true,
  // atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: {
        default: 400,
        parseHTML: el => {
          const style = el.getAttribute('style') || '';
          const match = style.match(/width:\s*(\d+)px/);
          return match ? parseInt(match[1]) : 400;
        },
        renderHTML: attrs => ({ style: `width: ${attrs.width}px;` }),
      },
      height: {
        default: null,
        parseHTML: el => {
          const style = el.getAttribute('style') || '';
          const match = style.match(/height:\s*(\d+)px/);
          return match ? parseInt(match[1]) : null;
        },
        renderHTML: attrs => (attrs.height ? { style: `height: ${attrs.height}px;` } : {}),
      },
      style: {
        default: '',
        parseHTML: el => el.getAttribute('style') || '',
        renderHTML: attrs => {
          return {
            style: attrs.style,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
  const styleEntries = [];

  if (HTMLAttributes.width) {
    styleEntries.push(`width: ${HTMLAttributes.width}px`);
  }
  if (HTMLAttributes.height) {
    styleEntries.push(`height: ${HTMLAttributes.height}px`);
  }
  if (HTMLAttributes.style) {
    styleEntries.push(HTMLAttributes.style);
  }

  const combinedStyle = styleEntries.join('; ');

  const { width, height, style, ...restAttrs } = HTMLAttributes;

  return ['div', { class: 'resizable-image-block' }, [
    'img',
    {
      ...restAttrs,
      style: combinedStyle
    }
  ]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  }
})

export default CustomResizableImage;
