import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Main.css';

const API_URL = 'http://localhost:5001/api/courses';

function Course() {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        description: '',
        credits: ''
    });

    const [courses, setCourses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setCourses(data);
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
            credits: formData.credits ? parseInt(formData.credits) : null
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
                    setCourses(courses.map(c => c._id === editId ? result : c));
                    alert("Course updated!");
                } else {
                    setCourses([result, ...courses]);
                    alert("Course created successfully!");
                }
                resetForm();
            }
        } catch (error) {
            alert("Action failed. Please check if the server is online.");
        }
    };

    const handleEdit = (course) => {
        setFormData({
            courseCode: course.courseCode,
            courseName: course.courseName,
            description: course.description || '',
            credits: course.credits || ''
        });
        setIsEditing(true);
        setEditId(course._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this course? This will remove teaching and enrollment relationships.")) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    setCourses(courses.filter(c => c._id !== id));
                }
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ courseCode: '', courseName: '', description: '', credits: '' });
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
                    <h1>COURSE CATALOG MANAGEMENT</h1>
                </header>

                <div className='card1'>
                    <div className='card1H'>
                        <h2>{isEditing ? '✎ UPDATE COURSE' : '+ CREATE NEW COURSE'}</h2>
                    </div>
                    
                    <form className='inputField' onSubmit={handleSave}>
                        <div>
                            <label htmlFor="courseCode">Course Code</label>
                            <input type="text" id="courseCode" name="courseCode" placeholder="e.g. CS101" value={formData.courseCode} onChange={handleChange} required />
                        </div>

                        <div>
                            <label htmlFor="credits">Credits</label>
                            <input type="number" id="credits" name="credits" placeholder="0" value={formData.credits} onChange={handleChange} required />
                        </div>

                        <div>
                            <label htmlFor="courseName">Course Name</label>
                            <input type="text" id="courseName" name="courseName" placeholder="e.g. Introduction to Programming" value={formData.courseName} onChange={handleChange} required />
                        </div>

                        <div className="buttonGroup">
                            <button type="submit">{isEditing ? 'Update Course' : 'Create Course'}</button>
                            <button type="button" onClick={resetForm}>{isEditing ? 'Cancel' : 'Reset'}</button>
                        </div>
                    </form>
                </div>

                <div className='card1'>
                    <div className='card1H'>
                        <h2>ACTIVE COURSES</h2>
                    </div>
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Course Name</th>
                                    <th>Credits</th>
                                    <th>Faculty</th>
                                    <th>Students</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((c) => (
                                    <tr key={c._id}>
                                        <td><strong>{c.courseCode}</strong></td>
                                        <td>{c.courseName}</td>
                                        <td>{c.credits}</td>
                                        <td>
                                            {c.faculty && c.faculty.length > 0 
                                                ? c.faculty.map(f => f.name).join(', ') 
                                                : <span className="text-muted">Unassigned</span>}
                                        </td>
                                        <td>
                                            {c.students ? c.students.length : 0} Enrolled
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(c._id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {courses.length === 0 && <p className="no-data">No courses found in the graph.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Course;