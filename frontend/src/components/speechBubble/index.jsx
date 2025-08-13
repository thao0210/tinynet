import styles from './styles.module.scss';
import classNames from 'classnames';

export const pathMap = {
  square: `M0 0 h240 v100 h-240 z`,
  ellipse: `M20,50 a100,40 0 1,0 200,0 a100,40 0 1,0 -200,0 z`,
  starburst: `M266.215 279.7313c.2575-.1266.2575-.3326 0-.4593l-26.1316-12.8752 18.1294-24.3361c.1715-.2301.0803-.3841-.2041-.344l-39.2161 5.5694 2.4953-26.271c.0269-.2859-.1658-.4281-.4304-.3175l-26.3409 10.988-4.4387-25.2632c-.0496-.2826-.2438-.3374-.4333-.1214L171.6498 226.7669l-15.8524-23.9439c-.1583-.2396-.404-.2325-.5486.0156l-15.9166 27.2855-22.4882-23.8357c-.197-.2088-.4101-.1517-.4763.1276l-5.9724 25.2698-26.3409-10.988c-.2651-.1106-.4697.0321-.4579.3194l1.1061 26.2691-37.2401-9.4377c-.2783-.0704-.3808.0699-.2287.3133l17.5959 28.2342L33.2607 281.8841c-.2575.1266-.2457.3015.0274.3908l31.5408 10.3317-18.5943 30.7097c-.1488.2457-.0491.37.223.2774l37.2519-12.6521-.1318 27.044c-.0014.2868.2122.43.4772.3199l26.3409-10.988 5.9913 30.4881c.0553.2816.2263.3142.3813.0728l16.4945-25.6421 18.8419 20.4744c.1942.2112.4815.189.6412-.0496l14.6466-21.8829 18.4866 21.9174c.1852.2192.4064.1758.4947-.0973l8.1445-25.2811 26.3409 10.9885c.2651.1106.4583-.0317.4319-.3175l-2.4976-27.0459 39.2213 7.9678c.2811.0572.3761-.0874.2117-.3227l-18.1426-25.9799L266.215 279.7313z`,
  cloud: "M40,50 C20,50 10,40 10,35 C0,20 20,10 40,15 C60,-5 110,-5 120,15 C140,-10 200,5 200,25 C220,25 240,45 220,60 C240,75 190,95 160,80 C130,95 80,95 60,80 C40,85 20,75 40,50 Z",
  comic: "M20,10 q100,-30 200,10 q10,50 -10,70 q-80,20 -180,0 q-20,-40 -10,-70 z", // exaggerated curve shape
};
const SpeechBubble = ({
  children,
  type = 'speech',
  direction = 'bottom-center',
  className,
  fill = '#fff',
  strokeColor = '#ccc',
  shape = 'rounded',
  opacity = 1
}) => {
  const pathD = pathMap[shape] || pathMap.rounded;
  const isThought = type === 'thought';
  const showDirection = direction && direction !== 'none';

  return (
    <div
      className={classNames(
        styles.bubbleContainer,
        showDirection && styles[direction],
        showDirection && styles[shape],
        type && styles[type],
        className
      )}
      style={{
        '--bubble-fill': strokeColor ? strokeColor : fill,
        '--bubble-opacity': opacity,
      }}
    >
      <svg
        className={styles.svgBackground}
        style={{ opacity, borderRadius: 20 }}
        viewBox={shape === 'starburst' ? '29 201 242 157' : '0 0 240 100'}
        preserveAspectRatio="none"
      >
        <path d={pathD} fill={fill} stroke={strokeColor} strokeWidth={3} style={{boxShadow: '2px 3px 5px #000'}} />
      </svg>

      <div className={styles.content}>{children}</div>

      {/* Vòng tròn cho thought */}
      {isThought && showDirection && (
        <div className={classNames(styles.dots, styles[direction])}>
          <span className={styles.dot1} />
          <span className={styles.dot2} />
          <span className={styles.dot3} />
        </div>
      )}
    </div>
  );
};

export default SpeechBubble;
