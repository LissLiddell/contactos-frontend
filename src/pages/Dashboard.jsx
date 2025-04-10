import { useMemo, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  }), [token]);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/contacts', config);
      setContacts(res.data);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Error al cargar contactos');
    }
  }, [config]);

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchContacts();
    }
  }, [navigate, token, fetchContacts])


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/contacts/${editingId}`, form, config);
      } else {
        await axios.post('http://localhost:5000/api/contacts', form, config);
      }
      setForm({ name: '', email: '', phone: '', notes: '' });
      setEditingId(null);
      fetchContacts();
    } catch (error) {
        console.error(error);
        alert(error?.response?.data?.message || 'Error al guardar');
      }
  };

  const handleEdit = (contact) => {
    setForm(contact);
    setEditingId(contact.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar contacto?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`, config);
      fetchContacts();
    } catch (error) {
        console.error(error);
        alert(error?.response?.data?.message || 'Error al guardar');
      }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container dashboard-container">
      <h2>Mis Contactos</h2>
      <br />
      <button onClick={logout} >Cerrar sesión</button>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Correo" value={form.email} onChange={handleChange} required />
        <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} required />
        <input name="notes" placeholder="Notas" value={form.notes} onChange={handleChange} />
        <button type="submit">{editingId ? 'Actualizar' : 'Agregar'}</button>
      </form>

      <ul>
        {contacts.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> - {c.email} - {c.phone}
            <br />
            {c.notes}
            <br />
            <button onClick={() => handleEdit(c)}>Editar</button>
            <button onClick={() => handleDelete(c.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;