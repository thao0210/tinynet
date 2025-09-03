import { pathMap } from "@/components/speechBubble";
import Dropdown from "@/components/dropdown";
import classes from './styles.module.scss';

const FrameOptionsForm = ({ frameOptions, onChange }) => {
  const arrowOptions = ['none', 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'left-center', 'right-center'];

  return (
    <div className={classes.textboxFrame} id="textbox-frame">
      <div>
        <label>Type</label>
        <Dropdown
          list={['none', 'speech', 'thought']}
          curValue={frameOptions?.type}
          onSelect={(val) => {
            if (val === 'none') {
              // reset toàn bộ field khác
              onChange({
                type: 'none',
                shape: '',
                fill: '',
                strokeColor: '',
                direction: 'none',
                opacity: '',
              });
            } else {
              onChange({ type: val });
            }
          }}
          width={130}
          dropdownContainerSelector='#textbox-frame'
        />
      </div>
      <div>
        <label>Shape</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(pathMap).map(([key, path]) => (
            <div
              key={key}
              title={key}
              onClick={() => frameOptions?.type !== 'none' && onChange({ shape: key })}
              style={{
                width: 50,
                height: 50,
                border: frameOptions?.shape === key ? '2px solid #00f' : '1px solid #ccc',
                borderRadius: 4,
                cursor: 'pointer',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg style={{borderRadius: 10}} viewBox={key === 'starburst' ? '29 201 242 157' : '0 0 240 100'} width="40" height="40">
                <path d={path} fill="#ccc" stroke="#000" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label>{frameOptions?.type === 'speech' ? 'Arrow ' : 'Thought trail ' } direction</label>
        <Dropdown
          list={arrowOptions}
          curValue={frameOptions?.direction}
          onSelect={(val) => frameOptions?.type !== 'none' && onChange({ direction: val })}
          width={130}
          dropdownContainerSelector='#textbox-frame'
        />
      </div>

      <div>
        <label>Fill</label>
        <input
          type="color"
          value={frameOptions?.fill || '#CCCCCC'}
          onChange={(e) => onChange({ fill: e.target.value })}
          disabled={frameOptions?.type === 'none'}
        />
      </div>

      <div>
        <label>Stroke</label>
        <input
          type="color"
          value={frameOptions?.strokeColor || '#CCCCCC'}
          onChange={(e) => onChange({ strokeColor: e.target.value })}
          disabled={frameOptions?.type === 'none'}
        />
      </div>
       <div>
        <label>Opacity</label>
        <input
          type="range"
          value={frameOptions?.opacity || 1}
          min={0}
          max={1}
          step={0.1}
          onChange={(e) => onChange({ opacity: e.target.value })}
          disabled={frameOptions?.type === 'none'}
        />
      </div>
    </div>
  );
};

export default FrameOptionsForm;