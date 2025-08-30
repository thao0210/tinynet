import { shapeIcons } from '@/components/themes/shapeIcons';
import classes from '../styles.module.scss';
import RadioList from '@/components/radio';
import { useEffect } from 'react';
import classNames from 'classnames';

const Shapes = ({ data, setData }) => {
  const themeShape = data.themeShape || {};

  const updateThemeShape = (updates) => {
    setData({
      ...data,
      themeShape: {
        ...themeShape,
        ...updates,
      },
    });
  };

  const renderSvgIcon = (Comp, isActive, onClick) => (
    <div
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        border: isActive ? '2px solid #333' : '1px solid #ccc',
        borderRadius: 4,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}
    >
      {Comp({ width: '70%', height: '70%' })}
    </div>
  );

  const renderImgIcon = (src, isActive, onClick, key) => (
    <img
      src={src}
      alt="img"
      onClick={onClick}
      key={key}
      style={{
        width: 40,
        height: 40,
        border: isActive ? '2px solid #333' : '1px solid #ccc',
        borderRadius: 4,
        cursor: 'pointer',
      }}
    />
  );

  useEffect(()=>{
    if (themeShape?.shapeColorType) {
        switch(themeShape.shapeColorType) {
            case 'Palette1':
                return updateThemeShape({shapeColor: ['#fed172', '#f3742b', '#b83a14','#612e37', '#231650']});
            case 'Pastel':
                return updateThemeShape({shapeColor: ['#60BFC1', '#BADFD7', '#F7E3DB', '#FDB7B9', '#C17779']});
            case 'Palette2': 
                return updateThemeShape({shapeColor: ['#913ccd', '#f06075', '#f76e3c','#f7d842', '#2ca8c2', '#98cb49', '#849098', '#5481e6']});;
            case 'Cards color':
                return updateThemeShape({shapeColor: ['#df0d0d', 'black']});
            case 'Custom color':
                if (!typeof themeShape.shapeColor === 'string')
                return updateThemeShape({shapeColor: '#000'});;
        }
    }
  }, [themeShape?.shapeColorType]);

  return (
    <div className={classes.shapes}>
        <label>Custom</label>
        <div className={classes.list}>
            {Array.from({ length: 14 }, (_, i) => `/shapes/${i + 1}.svg`).map((src, i) =>
            renderImgIcon(
                src,
                themeShape.group === 'custom' && themeShape.name === src,
                () => updateThemeShape({ group: 'custom', name: src }),
                `shape${i}`
            )
            )}
        </div>
        <label>Emoji</label>
        <div  className={classes.list}>
            <div
                onClick={() => updateThemeShape({ group: 'emoji', name: 'mix' })}
                className={classNames(classes.mix, {[classes.active]: themeShape.group === 'emoji' && themeShape.name === 'mix'})}
            >
            MIX
            </div>
        {[1, 2, 3, 4].map((name, i) => {
            const src = `/shapes/emoji/${name}.svg`;
            return renderImgIcon(
            src,
            themeShape.group === 'emoji' && themeShape.name === name,
            () => updateThemeShape({ group: 'emoji', name }),
            `emoji${i}`
            );
        })}
        </div>

        <label>Animals</label>
        <div className={classes.list}>
            <div
                onClick={() => updateThemeShape({ group: 'animals', name: 'mix' })}
                className={classNames(classes.mix, {[classes.active]: themeShape.group === 'animals' && themeShape.name === 'mix'})}
            >
            MIX
            </div>
        {[1, 2, 3, 4].map((name, i) => {
            const src = `/shapes/animals/${name}.svg`;
            return renderImgIcon(
            src,
            themeShape.group === 'animals' && themeShape.name === name,
            () => updateThemeShape({ group: 'animals', name }),
            `animal${i}`
            );
        })}
        </div>
      {/* Basic Group */}
      <label>Basic</label>
      <div className={classes.list}>
        <div
          onClick={() => updateThemeShape({ group: 'basic', name: 'mix' })}
          className={classNames(classes.mix, {[classes.active]: themeShape.group === 'basic' && themeShape.name === 'mix'})}
        >
          MIX
        </div>
        {Object.keys(shapeIcons.basic).map((name) =>
          renderSvgIcon(
            shapeIcons.basic[name],
            themeShape.group === 'basic' && themeShape.name === name,
            () => updateThemeShape({ group: 'basic', name })
          )
        )}
      </div>

      {/* Cards Group */}
      <label>Cards</label>
      <div className={classes.list}>
        <div
          onClick={() => updateThemeShape({ group: 'cards', name: 'mix' })}
          className={classNames(classes.mix, {[classes.active]: themeShape.group === 'cards' && themeShape.name === 'mix'})}
        >
          MIX
        </div>
        {Object.keys(shapeIcons.cards).map((name) =>
          renderSvgIcon(
            shapeIcons.cards[name],
            themeShape.group === 'cards' && themeShape.name === name,
            () => updateThemeShape({ group: 'cards', name })
          )
        )}
      </div>

      {(themeShape.group === 'cards' || themeShape.group === 'basic') && (
        <>
          <label>Shape Color</label>
          <RadioList
            list={['Palette1', 'Palette2', 'Pastel', 'Cards color', 'Custom color']}
            value={themeShape.shapeColorType || 'Palette1'}
            setValue={(type) => updateThemeShape({shapeColorType: type})}
            // data={data}
            // datafield='shapeColorType'
            // isVertical
          />
          {
            data.shapeColorType === 'Custom color' &&
            <input
                type="color"
                value={themeShape.shapeColor || '#000000'}
                onChange={(e) => updateThemeShape({ shapeColor: e.target.value })}
            />
          }
          
        </>
      )}

      <label>Background</label>
      <input
        type="color"
        value={themeShape.background || '#ffffff'}
        onChange={(e) => updateThemeShape({ background: e.target.value })}
      />

      <label>Opacity</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={themeShape.opacity || 0.5}
        onChange={(e) => updateThemeShape({ opacity: parseFloat(e.target.value) })}
      />

      <label>Shape Count</label>
      <input
        type="number"
        min="1"
        value={themeShape.count || 10}
        onChange={(e) => updateThemeShape({ count: parseInt(e.target.value) })}
      />
    </div>
  );
};

export default Shapes;