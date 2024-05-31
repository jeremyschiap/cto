import React, { useState } from 'react';
import axios from 'axios';
import './style.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', { email, password });
      setQrCodeUrl(response.data.qrCodeUrl);
      setSuccessMessage('Veuillez scanner ce code avec Google Authenticator');

    } catch (err) {
      setError(err.response?.data?.message || 'Echec , veuillez recommencer');
    }
  };

  return (
    <div>
      <h1>Inscription</h1>
      <form onSubmit={handleRegister}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">S'enregistrer</button>
      </form>
      <div className='qrcode'>
        {successMessage && <p>{successMessage}</p>} 
        <a href="/login">Me connecter</a><br></br>
        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Register;
