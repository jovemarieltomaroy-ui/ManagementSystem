import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Student from './Student.jsx';
import Faculty from './Faculty.jsx';
import Course from './Course.jsx';


function App() {
    return (
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="/students" />} /> 
          <Route path="/students" element={<Student />} /> 
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/course" element={<Course />} />
          <Route path="*" element={<Navigate to="/students" />} />
      </Routes>
    </Router>
  );
}
export default App
