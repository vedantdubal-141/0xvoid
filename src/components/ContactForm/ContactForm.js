import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('IDLE'); // IDLE, LOADING, SUCCESS, ERROR

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all fields.');
      return;
    }

    setStatus('LOADING');

    const emailData = {
      service_id: 'service_2zersy2',
      template_id: 'template_188znws',
      user_id: 'FR2SM_6WhDkyLJagL',
      template_params: {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
      }
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        setStatus('SUCCESS');
        setFormData({ name: '', email: '', message: '' });
      } else {
        const errText = await response.text();
        console.error('EmailJS Error:', errText);
        setStatus('ERROR');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setStatus('ERROR');
    }
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form-header">
        <h3 style={{ color: '#5abb9a', margin: 0 }}>Secure Message Gateway</h3>
        <span style={{ fontSize: '0.85em', color: '#888' }}>[ENCRYPTED PING]</span>
      </div>
      
      {status === 'SUCCESS' ? (
        <div className="contact-status success">
          [+] Payload delivered successfully. I will get back to you soon.
        </div>
      ) : status === 'ERROR' ? (
        <div className="contact-status error">
          [-] Transmission failed. Please try reaching me via LinkedIn or GitHub directly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="input-group">
            <label htmlFor="name">Sender ID (Name)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={status === 'LOADING'}
              spellCheck="false"
              autoComplete="off"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Return Protocol (Email)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={status === 'LOADING'}
              spellCheck="false"
              autoComplete="off"
            />
          </div>
          <div className="input-group flex-col">
            <label htmlFor="message">Payload (Message)</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              disabled={status === 'LOADING'}
              spellCheck="false"
            />
          </div>
          <button type="submit" className="contact-submit" disabled={status === 'LOADING'}>
            {status === 'LOADING' ? 'Transmitting...' : 'Initiate Handshake()'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
