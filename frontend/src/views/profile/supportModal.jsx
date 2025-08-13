import classes from './styles.module.scss';
import Modal from '@/components/modal';
import { medalUrl } from '@/sharedConstants/data';
import PaymentQRCode from '@/components/qrCode';

const SupportModal = ({setShowModal, note, payments, userInfo, imageFile}) => {
    return (
        <Modal width={900} setShowModal={setShowModal}>
            <div className={classes.reviewPayment}>
                <div>
                    <div className={classes.avatar}>
                        <span className={imageFile.includes('http') ? classes.hideOver : ''}>
                            <img src={imageFile} width={150} />
                        </span>
                        <div className={classes.userRank}>
                            <img src={medalUrl(userInfo.userRank)} height={100} />
                        </div>
                    </div>
                </div>
                <div>
                    {
                        note &&
                        <div className={classes.note}>{note}</div>
                    }
                    <h3>Support Methods</h3>
                    <ul>
                    {
                        payments.filter(
                            (m) => m.type?.trim() && m.value?.trim()
                        ).map((item, index) => (
                            <li key={`payment${index}`}>
                                <span>{item.type}</span>
                                {item.value.includes('http') ? 
                                    <a href={item.value} target='_blank'>{item.value}</a> : 
                                    <div>{item.value}</div>
                                }
                                <div>
                                <PaymentQRCode value={item.value} />
                                </div>
                            </li>
                        ))
                    }
                    </ul>
                </div>
            </div>
        </Modal>
    )
}

export default SupportModal;