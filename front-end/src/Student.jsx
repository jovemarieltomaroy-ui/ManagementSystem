import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Main.css';

const API_URL = 'http://localhost:5001/api/students';
const COURSES_API = 'http://localhost:5001/api/courses';

function Student() {
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        email: '',
        program: '', 
        courses: '' // This stores the selected Course UUID for the relationship
    });

    const [students, setStudents] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]); // Dynamic list for dropdown
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchStudents();
        fetchCourseOptions();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
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
        
        // Transform the single selected course ID into the array format your backend expects
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
                    setStudents(students.map(s => s._id === editId ? result : s));
                    alert("Student record updated!");
                } else {
                    setStudents([...students, result]);
                    alert("Student added to database!");
                }
                resetForm();
            }
        } catch (error) {
            alert("Could not save. Is the backend running?");
        }
    };

    const handleEdit = (student) => {
        setFormData({
            studentId: student.studentId,
            name: student.name,
            email: student.email,
            program: student.program || '',
            // Map existing course ID to the dropdown value
            courses: student.courses && student.courses.length > 0 ? student.courses[0]._id : ''
        });
        setIsEditing(true);
        setEditId(student._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (dbId) => {
        if (window.confirm("Are you sure you want to delete this student node?")) {
            try {
                const response = await fetch(`${API_URL}/${dbId}`, { method: 'DELETE' });
                if (response.ok) {
                    setStudents(students.filter(s => s._id !== dbId));
                }
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ studentId: '', name: '', email: '', program: '', courses: '' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className='app-container'>
            {/* SIDEBAR RESTORED */}
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

            {/* MAIN CONTENT AREA */}
            <div className='wrapper'>
                <header className="header">
                    <h1>STUDENT MANAGEMENT SYSTEM</h1>
                </header>

                <div className='card1'>
                    <div className='card1H'>
                        <h2>{isEditing ? '✎ UPDATE STUDENT' : '+ ADD STUDENT'}</h2>
                    </div>
                    
                    <form className='inputField' onSubmit={handleSave}>
                        <div>
                            <label htmlFor="name">Student Name</label>
                            <input type="text" id="name" name="name" placeholder="Enter name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="studentId">Student ID</label>
                            <input type="text" id="studentId" name="studentId" placeholder="Enter ID (e.g. 2024-0001)" value={formData.studentId} onChange={handleChange} required />
                        </div>
                        
                        {/* PROGRAM DROPDOWN */}
                        <div>
                            <label htmlFor="program">Program</label>
                            <input 
                                type="text" 
                                id="program" 
                                name="program" 
                                placeholder="e.g. BS Information Technology" 
                                value={formData.program} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* DYNAMIC COURSE DROPDOWN */}
                        <div>
                            <label htmlFor="courses">Enrolled Course</label>
                            <select id="courses" name="courses" value={formData.courses} onChange={handleChange}>
                                <option value="">-- Select Course from DB --</option>
                                {courseOptions.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.courseCode} - {c.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
                        </div>
                        
                        <div className="buttonGroup">
                            <button type="submit" className="btn-save">{isEditing ? 'Update' : 'Save'}</button>
                            <button type="button" className="btn-reset" onClick={resetForm}>{isEditing ? 'Cancel' : 'Reset'}</button>
                        </div>
                    </form>
                </div>

                {/* TABLE AREA */}
                <div className='card1'>
                    <div className='card1H'>
                        <h2>STUDENT LIST</h2>
                    </div>
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Student ID</th>
                                    <th>Program</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s._id}>
                                        <td>{s.name}</td>
                                        <td>{s.studentId}</td>
                                        <td>{s.program || 'N/A'}</td>
                                        <td>{s.email}</td>
                                        <td>
                                            {s.courses && s.courses.length > 0 
                                                ? s.courses.map(c => c.courseCode).join(', ') 
                                                : 'No Course'}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => handleEdit(s)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(s._id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="no-data">No students found in the graph.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Student;