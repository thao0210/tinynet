import classes from './styles.module.scss';
import urls from '@/sharedConstants/urls';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';

const PaymentDetails = ({note, setNote, payments, setPayments, setViewSupport}) => {

    const handleChange = (index, field, value) => {
        const updated = [...payments];
        updated[index][field] = value;
        setPayments(updated);
    };

    const handleAdd = () => {
        setPayments([...payments, { type: '', value: '' }]);
    };

    const handleRemove = (index) => {
        if (payments.length > 1) {
            const updated = payments.filter((_, i) => i !== index);
            setPayments(updated);
        } else {
            toast.error("At least one payment method is required.");
        }
    };

    const onChange = async () => {
        const validMethods = payments.filter(
            (m) => m.type?.trim() && m.value?.trim()
        );
    
        if (validMethods.length === 0) {
            toast.error("Please enter at least one valid payment method.");
            return;
        }

        try {
            const changeMethods = await api.put(urls.UPDATE_METHODS, {methods: validMethods, note: note},{
                headers: { 'Content-Type': 'application/json' }
              })
    
            if (changeMethods.data) {
                toast.success('Support Methods are updated successfully!');
            }
        } catch (error) {
            console.error(err);
        }
        
    }
    const isValid = () => {
        return payments.some(m => m.type?.trim() && m.value?.trim());
      }

    return (
        <div className={classes.form}>
            <p className='note'>Type can be Paypal, Momo, Bank account ... Please note that value should be detailed so users can support you.</p>
            <textarea
                placeholder="Introduce yourself or leave a note for your supporter..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                style={{ width: '100%', marginTop: '1rem' }}
            />
            {payments.map((method, idx) => (
                <div key={idx} className={classes.payment}>
                    <input
                        placeholder="Payment type"
                        value={method.type}
                        onChange={(e) => handleChange(idx, 'type', e.target.value)}
                    />
                    <input
                        placeholder="Value"
                        value={method.value}
                        onChange={(e) => handleChange(idx, 'value', e.target.value)}
                    />
                    <MdDelete size={20} onClick={() => handleRemove(idx)} />
                </div>
            ))}
            <div className='buttons'>
                <button className='btn sub' onClick={handleAdd}>+ Method</button>
                <button className='btn main2' onClick={() => setViewSupport(true)}>Review</button>
                <button className='btn sm' onClick={onChange} disabled={!isValid()}>Update</button>
            </div>
        </div>            
    )
}

export default PaymentDetails;