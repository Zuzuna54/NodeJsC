// TaskModal.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import './TaskModal.scss';


const TaskModal = ({ isOpen, onRequestClose, task, tasks, setTasks }) => {
    // const dispatch = useDispatch();
    // const [isEditing, setIsEditing] = useState(false);
    // const [editedTask, setEditedTask] = useState({
    //     title: '',
    //     description: '',
    //     priority: 0,
    //     status: '',
    // });
    // const accessToken = localStorage.getItem('accessToken');
    // const headers = {
    //     Authorization: `Bearer ${accessToken}`
    // };

    // useEffect(() => {
    //     // Update the editedTask state when the task prop changes
    //     setEditedTask({
    //         title: task?.title || '',
    //         description: task?.description || '',
    //         priority: task?.priority || 0,
    //         status: task?.status || '',
    //     });
    // }, [task]);

    // const handleEditClick = () => {
    //     setIsEditing(true);
    // };

    // const handleSaveClick = async () => {
    //     try {
    //         // Perform the update API call here
    //         const updatedTask = await updateTask(task._id, editedTask, headers);

    //         editedTask._id = task._id;

    //         if (updatedTask.status === 200) {
    //             dispatch(updateState(editedTask));
    //             tasks = tasks.map(task => {
    //                 if (task._id === editedTask._id) {
    //                     return { ...task, ...editedTask };
    //                 }
    //                 return task;
    //             });
    //             setTasks(tasks);
    //         }

    //         // Close the modal after successful update
    //         onRequestClose();
    //     } catch (error) {
    //         // Handle update error
    //         console.error('Error updating task:', error);
    //     }
    // };

    // const handleDeleteClick = async () => {
    //     try {
    //         // Perform the delete API call here
    //         const deletedTask = await deleteTask(task._id, headers);

    //         if (deletedTask.status === 200) {
    //             dispatch(deleteState(task._id));
    //             tasks = tasks.filter(origin => origin._id !== task._id);
    //             setTasks(tasks);
    //         }
    //         // Close the modal after successful delete
    //         onRequestClose();
    //     } catch (error) {
    //         // Handle delete error
    //         console.error('Error deleting task:', error);
    //     }
    // };

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setEditedTask((prevTask) => ({
    //         ...prevTask,
    //         [name]: value,
    //     }));
    // };

    // return (
    //     <Modal
    //         isOpen={isOpen}
    //         onRequestClose={onRequestClose}
    //         contentLabel="Task Details"
    //         className="modal"

    //     >
    //         {task && (
    //             <div>
    //                 {isEditing ? (
    //                     <div>
    //                         <label>Title:</label>
    //                         <input
    //                             type="text"
    //                             name="title"
    //                             value={editedTask.title}
    //                             onChange={handleInputChange}
    //                         />
    //                         <label>Description:</label>
    //                         <input
    //                             type="text"
    //                             name="description"
    //                             value={editedTask.description}
    //                             onChange={handleInputChange}
    //                         />
    //                         <label>Priority:</label>
    //                         <input
    //                             type="number"
    //                             name="priority"
    //                             value={editedTask.priority}
    //                             onChange={handleInputChange}
    //                         />
    //                         <label>Status:</label>
    //                         <select
    //                             name="status"
    //                             value={editedTask.status}
    //                             onChange={handleInputChange}
    //                         >
    //                             <option value="active">Active</option>
    //                             <option value="completed">Completed</option>
    //                         </select>
    //                         <div>
    //                             <button onClick={handleSaveClick}>Save</button>
    //                             <button onClick={() => setIsEditing(false)}>Cancel</button>
    //                         </div>
    //                     </div>
    //                 ) : (
    //                     <div>
    //                         <h2>{task.title}</h2>
    //                         <p>Description: {task.description}</p>
    //                         <p>Priority: {task.priority}</p>
    //                         <p>Status: {task.status}</p>
    //                         <p>Created At: {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
    //                         <div >
    //                             <button onClick={handleEditClick}>Edit</button>
    //                             <button onClick={handleDeleteClick}>Delete</button>
    //                             <button onClick={onRequestClose}>Close</button>
    //                         </div>
    //                     </div>
    //                 )}
    //             </div>
    //         )}
    //     </Modal>
    // );
};

export default TaskModal;
