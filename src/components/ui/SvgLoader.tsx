import Svg1Url from '../../loader-svg/1.svg';
import Svg2Url from '../../loader-svg/2.svg';
import Svg3Url from '../../loader-svg/3.svg';
import Svg4Url from '../../loader-svg/4.svg';
import './SvgLoader.css';

const SvgLoader = () => (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    transition: 'opacity 0.3s ease-in-out'
  }}>
    <div style={{ position: 'relative', width: '128px', height: '128px' }}>
      {/* SVG 1 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        animation: 'pulse1 1s infinite'
      }}>
        <img src={Svg1Url} style={{ width: '100%', height: '100%' }} />
      </div>
      
      {/* SVG 2 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        animation: 'pulse2 1s infinite'
      }}>
        <img src={Svg2Url} style={{ width: '100%', height: '100%' }} />
      </div>
      
      {/* SVG 3 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        animation: 'pulse3 1s infinite'
      }}>
        <img src={Svg3Url} style={{ width: '100%', height: '100%' }} />
      </div>
      
      {/* SVG 4 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        animation: 'pulse4 1s infinite'
      }}>
        <img src={Svg4Url} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  </div>
);

export default SvgLoader;