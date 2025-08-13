import { QRCodeSVG } from 'qrcode.react';

const PaymentQRCode = ({ value }) => (
  <QRCodeSVG value={value} size={128} />
);

export default PaymentQRCode;