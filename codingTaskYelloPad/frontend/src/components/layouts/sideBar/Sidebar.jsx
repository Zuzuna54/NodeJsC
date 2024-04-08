import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import FileUpload from '@mui/icons-material/FileUpload';
import History from '@mui/icons-material/History';

import './SideBar.scss';

export default function SideBar() {

    const navigate = useNavigate();

    return (
        <div className='sideBar'>


            <List className='nav-menu'>

                <div className='line-div'>
                    <div className='liner'></div>
                </div>

                {/*All Tasks */}
                <ListItem button onClick={() => navigate('/dashboard/upload')}>
                    <ListItemIcon>
                        <FileUpload />
                    </ListItemIcon>
                    <ListItemText primary='Upload File' />
                </ListItem>

                {/*Tasker Panel */}
                <ListItem button onClick={() => navigate('/dashboard/history')}>
                    <ListItemIcon>
                        <History />
                    </ListItemIcon>
                    <ListItemText primary='History' />
                </ListItem>

                <div className='line-div'>
                    <div className='liner'></div>
                </div>

            </List>


        </div>
    );
}
