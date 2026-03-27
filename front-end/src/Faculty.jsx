import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Main.css';


const API_URL = 'http://localhost:5001/api/faculty'; 
const COURSES_API = 'http://localhost:5001/api/courses';

function Faculty() {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        department: '',
        courses: '' 
    });

    const [faculties, setFaculties] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchFaculties();
        fetchCourseOptions();
    }, []);

    const fetchFaculties = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setFaculties(data);
        } catch (error) {
            console.error("Error fetching faculty:", error);
        }
    };

    const fetchCourseOptions = async () => {
        try {
            const response = await fetch(COURSES_API);
            const data = await response.json();
            setCourseOptions(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
     
        const payload = {
            ...formData,
            courses: formData.courses ? [formData.courses] : []
        };

        try {
            const url = isEditing ? `${API_URL}/${editId}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                if (isEditing) {
                    setFaculties(faculties.map(f => f._id === editId ? result : f));
                    alert("Faculty record updated!");
                } else {
                    setFaculties([result, ...faculties]);
                    alert("Faculty added to database!");
                }
                resetForm();
            }
        } catch (error) {
            alert("Could not save. Is the backend running?");
        }
    };

    const handleEdit = (faculty) => {
        setFormData({
            name: faculty.name,
            address: faculty.address || '',
            department: faculty.department || '',
            courses: faculty.courses && faculty.courses.length > 0 ? faculty.courses[0]._id : ''
        });
        setIsEditing(true);
        setEditId(faculty._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (dbId) => {
        if (window.confirm("Are you sure you want to delete this faculty member?")) {
            try {
                const response = await fetch(`${API_URL}/${dbId}`, { method: 'DELETE' });
                if (response.ok) {
                    setFaculties(faculties.filter(f => f._id !== dbId));
                }
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', department: '', courses: '' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className='app-container'>
            <nav className="sidebar">
                <div className="sidebar-logo">
                    <h2>MANAGEMENT SYSTEM</h2>
                </div>
                <ul className="sidebar-links">
                    <li>
                        <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
                             Students
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/faculty" className={({ isActive }) => (isActive ? "active" : "")}>
                           Faculty
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/course" className={({ isActive }) => (isActive ? "active" : "")}>
                             Courses
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className='wrapper'>
                <header className="header">
                    <h1>FACULTY MANAGEMENT SYSTEM</h1>
                </header>

                <div className='card1'>
                    <div className='card1H'>
                        <h2>{isEditing ? '✎ UPDATE FACULTY' : '+ ADD FACULTY'}</h2>
                    </div>
                    
                    <form className='inputField' onSubmit={handleSave}>
                        <div>
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" placeholder="Enter faculty name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="department">Department</label>
                            <input type="text" id="department" name="department" placeholder="Department e.g. IT" value={formData.department} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="address">Address</label>
                            <input type="text" id="address" name="address" placeholder="Enter home address" value={formData.address} onChange={handleChange} required />
                        </div>

                        <div>
                            <label htmlFor="courses">Assigned Course</label>
                            <select id="courses" name="courses" value={formData.courses} onChange={handleChange}>
                                <option value="">-- Select Course --</option>
                                {courseOptions.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.courseCode} - {c.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="buttonGroup">
                            <button type="submit" className="btn-save">{isEditing ? 'Update' : 'Save'}</button>
                            <button type="button" className="btn-reset" onClick={resetForm}>{isEditing ? 'Cancel' : 'Reset'}</button>
                        </div>
                    </form>
                </div>

                <div className='card1'>
                    <div className='card1H'>
                        <h2>FACULTY LIST</h2>
                    </div>
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Address</th>
                                    <th>Teaching</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faculties.map((f) => (
                                    <tr key={f._id}>
                                        <td>{f.name}</td>
                                        <td>{f.department || 'N/A'}</td>
                                        <td>{f.address}</td>
                                        <td>
                                            {f.courses && f.courses.length > 0 
                                                ? f.courses.map(c => c.courseCode).join(', ') 
                                                : 'No Courses'}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => handleEdit(f)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(f._id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {faculties.length === 0 && <p className="no-data">No faculty nodes found in the graph.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Faculty;