import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { supabase } from '../config/supabase';
import '../App.css';

function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editingUser.name,
          role: editingUser.role,
          stream: editingUser.stream,
          degree_type: editingUser.degree_type
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setMessage('✅ User updated successfully!');
      setShowModal(false);
      setEditingUser(null);
      fetchUsers(); // Refresh list
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error updating user: ' + error.message);
    }
  };

  const getRoleVariant = (role) => {
    const variants = {
      student: 'success',
      lecturer: 'primary',
      prl: 'warning',
      pl: 'info',
      admin: 'danger'
    };
    return variants[role] || 'secondary';
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <Card.Body className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading users...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Card.Header>
          <h4>👥 User Management</h4>
          <small className="text-muted">Manage system users and their roles</small>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={message.includes('') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <Table responsive striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Stream</th>
                <th>Program</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td>
                    <strong>{userItem.name}</strong>
                    {userItem.id === user.id && (
                      <Badge bg="info" className="ms-2">You</Badge>
                    )}
                  </td>
                  <td>{userItem.email}</td>
                  <td>
                    <Badge bg={getRoleVariant(userItem.role)}>
                      {userItem.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td>{userItem.stream}</td>
                  <td>{userItem.degree_type}</td>
                  <td>{new Date(userItem.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(userItem)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-center text-muted">
            <small>Total Users: {users.length}</small>
          </div>
        </Card.Body>
      </Card>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <Form>

                // In the edit form, add these fields
                <Form.Group className="mb-3">
                <Form.Label>Stream</Form.Label>
                <Form.Select
                    value={editingUser.stream}
                    onChange={(e) => setEditingUser({...editingUser, stream: e.target.value})}
                >
                    <option value="">Select Stream...</option>
                    <option value="IT">Information Technology</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="N/A">Not Applicable</option>
                </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Program Type</Form.Label>
                <Form.Select
                    value={editingUser.program_type}
                    onChange={(e) => setEditingUser({...editingUser, program_type: e.target.value})}
                >
                    <option value="">Select Program Type...</option>
                    <option value="Degree">Degree Program Leader</option>
                    <option value="Diploma">Diploma Program Leader</option>
                    <option value="N/A">Not Applicable</option>
                </Form.Select>
                </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="prl">Principal Lecturer (PRL)</option>
                  <option value="pl">Program Leader (PL)</option>
                  <option value="admin">Administrator</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Stream</Form.Label>
                <Form.Select
                  value={editingUser.stream}
                  onChange={(e) => setEditingUser({...editingUser, stream: e.target.value})}
                >
                  <option value="IT">Information Technology</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="N/A">Not Applicable</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Program Type</Form.Label>
                <Form.Select
                  value={editingUser.degree_type}
                  onChange={(e) => setEditingUser({...editingUser, degree_type: e.target.value})}
                >
                  <option value="Degree">Degree</option>
                  <option value="Diploma">Diploma</option>
                  <option value="N/A">Not Applicable</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserManagement;