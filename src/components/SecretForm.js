import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Modal } from 'react-bootstrap';
import { generateSecretKey } from '../utils/wordList';

const PANTRY_ID = process.env.REACT_APP_PANTRY_ID;
const STORAGE_KEY = 'lastSecretKey';

const SecretForm = () => {
  const [formData, setFormData] = useState({
    secretKey: '',
    secret: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyCheckTimeout, setKeyCheckTimeout] = useState(null);
  const [hasExistingSecret, setHasExistingSecret] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [tempSecretData, setTempSecretData] = useState(null);
  const [isPasswordCheck, setIsPasswordCheck] = useState(false);

  // Sayfa yüklendiğinde localStorage'dan anahtarı kontrol et
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      setFormData(prev => ({ ...prev, secretKey: savedKey }));
      fetchExistingSecret(savedKey);
    }
  }, []);

  const fetchExistingSecret = async (key) => {
    try {
      const response = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${key}`);
      
      if (response.status === 400) {
        setError('Bu anahtar için kayıtlı bir gizli bilgi bulunamadı.');
        setFormData(prev => ({ ...prev, secret: '' }));
        return;
      }

      if (!response.ok) {
        throw new Error('Veri alınırken bir hata oluştu');
      }

      const data = await response.json();
      if (data.password) {
        setTempSecretData(data);
        setIsPasswordCheck(false);
        setShowPasswordModal(true);
        setHasExistingSecret(true);
        setError(null);
      }
    } catch (err) {
      console.error('Veri getirme hatası:', err);
      setError('Gizli bilgi kontrol edilirken bir hata oluştu.');
    }
  };

  const handleGenerateKey = () => {
    setIsLoading(true);
    try {
      const newKey = generateSecretKey();
      setFormData(prev => ({ ...prev, secretKey: newKey }));
      // Yeni anahtarı localStorage'a kaydet
      localStorage.setItem(STORAGE_KEY, newKey);
      setError(null);
    } catch (err) {
      setError('Anahtar oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'secretKey' && value.trim()) {
      // Anahtarı localStorage'a kaydet
      localStorage.setItem(STORAGE_KEY, value.trim());
      
      if (keyCheckTimeout) {
        clearTimeout(keyCheckTimeout);
      }

      const timeoutId = setTimeout(() => {
        fetchExistingSecret(value);
      }, 500);
      setKeyCheckTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Şifre modalını aç ve geçici veriyi sakla
    setTempSecretData({
      secret: formData.secret,
      timestamp: new Date().toISOString()
    });
    setShowPasswordModal(true);
    setIsLoading(false);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError('Şifre boş olamaz');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const secretData = {
        ...tempSecretData,
        password: password // şifreyi de kaydet
      };

      const response = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${formData.secretKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secretData),
      });

      if (!response.ok) {
        throw new Error('Veri kaydedilirken bir hata oluştu');
      }

      setHasExistingSecret(true);
      setShowSuccess(true);
      setShowPasswordModal(false);
      setPassword('');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Gizli bilgi kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('API Hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordCheck = () => {
    if (isPasswordCheck) {
      // Silme işlemi için şifre kontrolü
      if (tempSecretData?.password === password) {
        handleDelete();
        setShowPasswordModal(false);
        setPassword('');
        setError(null);
      } else {
        setError('Yanlış şifre!');
      }
    } else {
      // Görüntüleme için şifre kontrolü
      if (tempSecretData?.password) {
        if (tempSecretData.password === password) {
          // Şifre doğruysa veriyi göster
          setFormData(prev => ({ ...prev, secret: tempSecretData.secret }));
          setShowPasswordModal(false);
          setPassword('');
          setError(null);
        } else {
          setError('Yanlış şifre!');
        }
      } else {
        // Yeni kayıt
        handlePasswordSubmit();
      }
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${formData.secretKey}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Veri silinirken bir hata oluştu');
      }

      localStorage.removeItem(STORAGE_KEY);
      setFormData({ secretKey: '', secret: '' });
      setHasExistingSecret(false);
      setShowSuccess(true);
      setError(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Gizli bilgi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Silme Hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    setIsPasswordCheck(true);
    setShowPasswordModal(true);
  };

  return (
    <Container className="mt-5">
      {showSuccess && (
        <Alert variant="success" className="mb-4">
          {formData.secretKey ? 'Gizli bilginiz başarıyla kaydedildi!' : 'Gizli bilginiz başarıyla silindi!'}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Gizli Anahtar</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Anahtar oluştur butonuna tıklayın"
              required
            />
            <Button 
              variant="secondary" 
              onClick={handleGenerateKey}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? 'Oluşturuluyor...' : 'Anahtar Oluştur'}
            </Button>
          </div>
          <Form.Text className="text-muted">
            "Anahtar Oluştur" butonuna tıklayarak benzersiz bir anahtar alabilirsiniz. Bu anahtarı not almayı unutmayın!
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Gizli Bilgi</Form.Label>
          <Form.Control
            as="textarea"
            name="secret"
            value={formData.secret}
            onChange={handleChange}
            placeholder="Gizli bilginizi buraya yazın..."
            rows={3}
            required
          />
        </Form.Group>

        <div className="d-flex gap-2 justify-content-center">
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          {hasExistingSecret && (
            <Button 
              variant="danger" 
              onClick={handleDeleteClick}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? 'Siliniyor...' : 'Sil'}
            </Button>
          )}
        </div>
      </Form>

      <Modal show={showDeleteModal} onHide={handleDeleteCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu gizli bilgiyi silmek istediğinizden emin misiniz? Silme işlemi için şifrenizi girmeniz gerekecektir.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Devam Et
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPasswordModal} onHide={() => {
        setShowPasswordModal(false);
        setPassword('');
        setError(null);
        setIsPasswordCheck(false);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isPasswordCheck 
              ? 'Silme İşlemi için Şifre Kontrolü' 
              : tempSecretData?.password 
                ? 'Şifre Kontrolü'
                : 'Şifre Belirleme'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              {isPasswordCheck 
                ? 'Silme işlemini onaylamak için şifrenizi girin'
                : tempSecretData?.password
                  ? 'Gizli bilgiyi görüntülemek için şifrenizi girin'
                  : 'Gizli bilgi için bir şifre belirleyin'}
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
            />
          </Form.Group>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowPasswordModal(false);
            setPassword('');
            setError(null);
            setIsPasswordCheck(false);
          }}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePasswordCheck}
            disabled={!password.trim()}
          >
            {isPasswordCheck 
              ? 'Onayla' 
              : tempSecretData?.password
                ? 'Kontrol Et'
                : 'Kaydet'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SecretForm; 