
export const hexToRGBA = (hex) => {
  // Loại bỏ dấu #
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return (alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
};

export const getBrightIndex = (hexcolor) => {
  if (hexcolor) {
      var r = parseInt(hexcolor.substr(1,2),16);
      var g = parseInt(hexcolor.substr(3,2),16);
      var b = parseInt(hexcolor.substr(4,2),16);
      var yiq = ((r*299)+(g*587)+(b*114))/1000;
      return yiq;
  }
  return 255;
}

export const parseCssGradientToQrGradient = (gradientStr) => {
  const linearMatch = gradientStr.match(/linear-gradient\(([^,]+),\s*(.+)\)/i);
  const radialMatch = gradientStr.match(/radial-gradient\(([^,]+),\s*(.+)\)/i);

  if (linearMatch) {
    const angleStr = linearMatch[1].trim();
    const colorStopsStr = linearMatch[2];
    const angleDeg = parseFloat(angleStr);
    const rotation = (angleDeg % 360) / 360;

    const colorStops = colorStopsStr.split(",").map(stop => {
      const [color, offsetStr] = stop.trim().split(/\s+/);
      return {
        color,
        offset: parseFloat(offsetStr) / 100
      };
    });

    return {
      type: "linear",
      rotation,
      colorStops
    };
  }

  if (radialMatch) {
    const colorStopsStr = radialMatch[2];
    const colorStops = colorStopsStr.split(",").map(stop => {
      const [color, offsetStr] = stop.trim().split(/\s+/);
      return {
        color,
        offset: parseFloat(offsetStr) / 100
      };
    });

    return {
      type: "radial",
      colorStops
    };
  }

  return null;
}

export const setBackground = (images, color) => {
      const arr = [];
      if (images &&  images.length) {
        images.forEach(image => 
          arr.push(`url(${image.url}) ${image.repeat} ${image.position}/${image.size === 'custom' && image.customSize ? image.customSize + 'px' : image.size}`)  
        )
      };

      if (color) {
        arr.push(color);
      };

      if (arr.length > 0) return {background: arr.join(',')};
      return null;
  }

export const themeBg = (theme) => {
      const baseUrl = import.meta.env.VITE_R2_BASE_URL;
      const data = {
        background: `url(${baseUrl}/dec/8.webp) no-repeat center center/cover`,
        rainColor: '#FFFFFF',
        angle: -25,
        count: 200,
        minLength: 60,
        maxLength: 100,
        speed: 30
      }
      switch(theme) {
          case 'theme9':
          return {
            background: `url(${baseUrl}/dec/9.webp) no-repeat center center/cover`,
            rainColor: 'RGBA(255,255,255,0.3)',
            angle: 0,
            count: 500,
            minLength: 10,
            maxLength: 30,
            speed: 80
          }
          case 'theme10':
          return {
            background: 'linear-gradient( #527e95, #103c51)',
            rainColor: 'RGBA(255,255,255,0.3)',
            angle: 0,
            count: 500,
            minLength: 20,
            maxLength: 30,
            speed: 40
          }
          case 'theme11':
          return {
            background: `url(${baseUrl}/dec/11.webp) no-repeat center center/cover`,
            rainColor: 'RGBA(255,255,255,0.3)',
            angle: 0,
            count: 500,
            minLength: 30,
            maxLength: 50,
            speed: 40
          }
      }
      return data;
    }

export function generateRainboxShadow(fontSize) {
  const size = parseFloat(fontSize);
  const scale = size / 100; // gốc là hiệu ứng thiết kế cho 100px

  return [
    `${5 * scale}px ${5 * scale}px 0px #eb452b`,
    `${10 * scale}px ${10 * scale}px 0px #efa032`,
    `${15 * scale}px ${15 * scale}px 0px #46b59b`,
    `${20 * scale}px ${20 * scale}px 0px #017e7f`,
    `${25 * scale}px ${25 * scale}px 0px #052939`,
  ].join(', ');
}

export function generateCartoonShadow(fontSize) {
  const size = parseFloat(fontSize);
  const s = size / 100; // scale factor
  return [
    `0px ${-6 * s}px 0 #212121`,
    `0px ${6 * s}px 0 #212121`,
    `${-6 * s}px 0px 0 #212121`,
    `${6 * s}px 0px 0 #212121`,
    `${-6 * s}px ${-6 * s}px 0 #212121`,
    `${6 * s}px ${-6 * s}px 0 #212121`,
    `${-6 * s}px ${6 * s}px 0 #212121`,
    `${6 * s}px ${6 * s}px 0 #212121`,
    `${-6 * s}px ${18 * s}px 0 #212121`,
    `0px ${18 * s}px 0 #212121`,
    `${6 * s}px ${18 * s}px 0 #212121`,
    `0 ${19 * s}px ${1 * s}px rgba(0,0,0,.1)`,
    `0 0 ${6 * s}px rgba(0,0,0,.1)`,
    `0 ${6 * s}px ${3 * s}px rgba(0,0,0,.3)`,
    `0 ${12 * s}px ${6 * s}px rgba(0,0,0,.2)`,
    `0 ${18 * s}px ${18 * s}px rgba(0,0,0,.25)`,
    `0 ${24 * s}px ${24 * s}px rgba(0,0,0,.2)`,
    `0 ${36 * s}px ${36 * s}px rgba(0,0,0,.15)`
  ].join(', ');
}