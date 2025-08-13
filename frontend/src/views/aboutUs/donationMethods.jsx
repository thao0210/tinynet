import classes from './styles.module.scss';

const baseUrl = import.meta.env.VITE_R2_BASE_URL;
const data = [
    {
        url: 'https://paypal.me/thaonguyennet',
        qr: baseUrl + '/qr-paypal.webp'
    },
    {
        url: 'https://me.momo.vn/thaonguyennet',
        qr: baseUrl + '/qr-momo.webp'
    },
    {
        url: 'https://buymeacoffee.com/tinynet',
        qr: baseUrl + '/qr-bmac.webp'
    }
]
const DonationMethods = () => {
    return (
        <div className={classes.form}>
            <h2>Support Our Work</h2>
            <p>
                If you find this project useful or inspiring, your support means the world to us!
Any contribution helps us keep building and improving.
            </p>
            <p>
<strong>Thank you for considering a donation – you are amazing! 🙏</strong></p>
            <p>
👉 Choose your preferred method below:
            </p>
            <div className={classes.methods}>
                <ul>
                    {
                        data.map((item, index) => (
                            <li>
                                <a href={item.url}>{item.url}</a><br />
                                <img src={item.qr} width={250} />
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

export default DonationMethods;