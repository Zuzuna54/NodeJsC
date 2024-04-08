import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import './History.scss';

const PAGE_SIZE = 8; // Number of tasks per page

const sortTasks = (tasks, order, sortByProperty) => {
    return [...tasks].sort((a, b) => {
        if (sortByProperty === 'priority') {
            const priorityA = a.priority || 0;
            const priorityB = b.priority || 0;
            return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
        } else if (sortByProperty === 'createdAt') {
            const createdAtA = new Date(a.createdAt).getTime();
            const createdAtB = new Date(b.createdAt).getTime();
            return order === 'asc' ? createdAtA - createdAtB : createdAtB - createdAtA;
        } else {
            return 0;
        }
    });
};

export default function AllTasks() {
    // const dispatch = useDispatch();
    // const [sortOrder, setSortOrder] = useState('asc');
    // const [sortBy, setSortBy] = useState('priority');
    // const [tasks, setTasksState] = useState([]);
    // const [selectedTask, setSelectedTask] = useState(null);
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [searchTerm, setSearchTerm] = useState('');
    // const [currentPage, setCurrentPage] = useState(1);
    // const [loading, setLoadingState] = useState(false);
    // const [error, setErrorState] = useState(null);

    // useEffect(() => {
    //     const fetchTasks = async () => {
    //         try {
    //             setLoadingState(true);
    //             setErrorState(null);

    //             const accessToken = localStorage.getItem('accessToken');
    //             const headers = {
    //                 Authorization: `Bearer ${accessToken}`,
    //             };

    //             const response = await getTasks(headers);

    //             if (Array.isArray(response?.data.tasks)) {
    //                 const allTasks = response.data.tasks;
    //                 dispatch(setTasks(allTasks));
    //                 setTasksState(allTasks);
    //             } else {
    //                 console.error('Invalid data structure for tasks:', response?.data);
    //                 setErrorState('Invalid data structure for tasks');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching tasks:', error.message);
    //             setErrorState('Error fetching tasks');
    //         } finally {
    //             setLoadingState(false);
    //         }
    //     };

    //     fetchTasks();
    // }, [dispatch]);

    // const openModal = (task) => {
    //     setSelectedTask(task);
    //     setIsModalOpen(true);
    // };

    // const closeModal = () => {
    //     setSelectedTask(null);
    //     setIsModalOpen(false);
    // };

    // const toggleSortOrder = () => {
    //     const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    //     setSortOrder(newSortOrder);
    //     setTasksState((prevTasks) => sortTasks(prevTasks, newSortOrder, sortBy));
    // };

    // const handleSortChange = (e) => {
    //     const selectedSortBy = e.target.value;
    //     setSortBy(selectedSortBy);
    //     setTasksState((prevTasks) => sortTasks(prevTasks, sortOrder, selectedSortBy));
    // };

    // const formatTimeAgo = (date) => {
    //     return formatDistanceToNow(new Date(date), { addSuffix: true });
    // };

    // const handleSearchChange = (e) => {
    //     setSearchTerm(e.target.value);
    //     setCurrentPage(1); // Reset to the first page when the search term changes
    // };

    // const filteredTasks = useMemo(() => {
    //     return tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    // }, [tasks, searchTerm]);

    // const paginatedTasks = useMemo(() => {
    //     const startIndex = (currentPage - 1) * PAGE_SIZE;
    //     const endIndex = startIndex + PAGE_SIZE;
    //     return filteredTasks.slice(startIndex, endIndex);
    // }, [filteredTasks, currentPage]);

    // const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);

    // const handlePageChange = (newPage) => {
    //     setCurrentPage(newPage);
    // };

    // return (
    //     <div className="tasks-container">
    //         <TaskModal
    //             isOpen={isModalOpen}
    //             onRequestClose={closeModal}
    //             task={selectedTask}
    //             setTasks={setTasksState}
    //             tasks={tasks}
    //         />

    //         <h1>All Tasks</h1>
    //         {loading && <div>Loading...</div>}
    //         {error && <div className="error-message">{error}</div>}
    //         <div className="filters">
    //             <div className="search">
    //                 <label>Search:</label>
    //                 <input
    //                     type="text"
    //                     value={searchTerm}
    //                     onChange={handleSearchChange}
    //                     placeholder="Search tasks..."
    //                 />
    //             </div>
    //             <div className="filter">
    //                 <label>Sort By:</label>
    //                 <select value={sortBy} onChange={handleSortChange}>
    //                     <option value="priority">Priority</option>
    //                     <option value="createdAt">Created Date</option>
    //                 </select>
    //                 <select value="none" onChange={toggleSortOrder}>
    //                     <option value="none">Select</option>
    //                     <option value="asc">{sortBy === 'priority' ? 'Ascending' : 'Oldest'}</option>
    //                     <option value="desc">{sortBy === 'priority' ? 'Descending' : 'Newest'}</option>
    //                 </select>
    //             </div>
    //         </div>

    //         <div className="tasks-cont">
    //             {Array.isArray(paginatedTasks) &&
    //                 paginatedTasks.map((task) => (
    //                     <div className="task" key={task.id}>
    //                         <div className="title">
    //                             Title: <span>{task.title}</span>
    //                         </div>
    //                         <div>
    //                             Priority: <span>{task.priority}</span>
    //                         </div>
    //                         <div>
    //                             Created At: <span>{formatTimeAgo(task.createdAt)}</span>
    //                         </div>
    //                         <div>
    //                             {task.status === 'active' ? (
    //                                 <span className="active">Active</span>
    //                             ) : (
    //                                 <span className="completed">Completed</span>
    //                             )}
    //                         </div>
    //                         <button onClick={() => openModal(task)}>View Details</button>
    //                     </div>
    //                 ))}
    //         </div>
    //         <div className="pagination">
    //             <button
    //                 onClick={() => handlePageChange(currentPage - 1)}
    //                 disabled={currentPage === 1}
    //             >
    //                 Previous
    //             </button>
    //             <span>{`Page ${currentPage} of ${totalPages}`}</span>
    //             <button
    //                 onClick={() => handlePageChange(currentPage + 1)}
    //                 disabled={currentPage === totalPages}
    //             >
    //                 Next
    //             </button>
    //         </div>
    //     </div>
    // );
}
