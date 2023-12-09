import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import '../styles/Chat.css'
import { useRef } from 'react';
import ProgressBar from './ProgressBar';


const drawerWidth = 240;


export default function Chat() {
    const [percentage, setPercentage] = useState(0);
    const navigate = useNavigate()
    const [users, setUsers] = useState([]);
    const [me, setMe] = useState({});
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(localStorage.getItem('selected_user'));
    const [selectedUser, setSelectedUser] = useState([]);
    const [uploadFile, setUploadFile] = useState('');
    const [files, setFiles] = useState([]);
    const [files2, setFiles2] = useState([]);
    const id_user = localStorage.getItem('id_user')
    const user = localStorage.getItem('selected_user')
    const socket = useRef()
    const pause = useRef(false);
    const [arr, setArr] = useState([]);
    const dataToSendRef = useRef([]);
    const dataIndexRef = useRef(0);
    const chunkCompletedRef = useRef(0);
    const [isUpload, setIsUpload] = useState(false);
    const [isPause, setIsPause] = useState(false);
    const [isResume, setIsResume] = useState(false);



    useEffect(() => {
        getUsers()
        getUsersById(id_user)
        if (user) {
            getFiles(selectedUserId)
            getFiles2(selectedUserId)
        }
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            getFiles(selectedUserId)
            getFiles2(selectedUserId)
            getSelUserById(selectedUserId)
        }
    }, [selectedUserId]);


    useEffect(() => {
        if (user && id_user) {
            if (parseInt(id_user) < parseInt(user)) {
                socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id_user}_${user}/`)
            } else {
                socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${user}_${id_user}/`)
            }
            socket.current.onmessage = (e) => {
                var data = JSON.parse(e.data);
                console.log(data)
                if (data.sender == user) {
                    getFiles2(selectedUserId)
                }
            };
            socket.current.onclose = function (event) {
                if (event.wasClean) {
                    alert(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
                } else {
                    // например, сервер убил процесс или сеть недоступна
                    // обычно в этом случае event.code 1006
                    alert('[close] Соединение прервано');
                }
            };
        }
    }, [id_user, user]);

    const [file, setFile] = useState({});
    const onFileChange = (event) => {
        setIsUpload(true)
        getBase64(event.target.files[0])
        setUploadFile(event.target.files[0])
    }


    async function getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setFile(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
            return error
        };
    }

    const sendNextChunk = () => {
        if (dataIndexRef.current < dataToSendRef.current.length && !pause.current) {
            chunkCompletedRef.current++;
            console.log(chunkCompletedRef)
            socket.current.send(JSON.stringify(dataToSendRef.current[dataIndexRef.current]));
            console.log(`Отправился ${dataIndexRef.current} кусочук`)
            let result = Math.floor(Math.round((chunkCompletedRef.current * 100) / (dataToSendRef.current.length * 2)))
            setPercentage(result)
            dataIndexRef.current++;
            setTimeout(sendNextChunk, 0); // отправляем данные каждые 100 мс
        } else{

        }
    };

    const uploadFileData = (event) => {
        if (uploadFile) {
            let fff = file.match(/.{1,1000000}/g)
            for (let i = 0; i < fff.length; i++) {
                let filll = fff[i];
                let array = arr
                const fileData = {
                    'file_name': uploadFile.name,
                    'file_size': uploadFile.size,
                    'file_extension': uploadFile.name.split('.').pop(),
                    'file_content': filll,
                    'sender': id_user,
                    'recipient': user,
                    'status': 'ok',
                    'full': 'ok',
                    'close': pause,
                    'chunk_now': i,
                    'chunk_all': fff.length - 1,
                    request_id: Date.now(),
                    action: 'receive'
                };
                array.push(fileData)
                setArr(array)
            }
            dataToSendRef.current = arr;
            dataIndexRef.current = 0;
            setIsUpload(false)
            setIsPause(true)
            sendNextChunk();
            socket.current.onmessage = (e) => {
                var data = JSON.parse(e.data);
                console.log(data)
                if (data.chunk_completed == data.chunk_all) {
                    setPercentage(100)
                    chunkCompletedRef.current = 0
                    setIsUpload(true)
                    setIsPause(false)
                    setIsResume(false)
                    setUploadFile('')
                } else {
                    chunkCompletedRef.current++
                    let result = Math.floor(Math.round((chunkCompletedRef.current * 100) / (dataToSendRef.current.length * 2)))
                    setPercentage(result)
                    console.log(chunkCompletedRef)
                }
                if (data.sender == id_user) {
                    getFiles(selectedUserId)
                }
            };
            socket.current.onclose = function (event) {
                console.log(event.reason)
            };
        }
    }

    const pauseFileData = (event) => {
        pause.current = true
        setIsResume(true)
        setIsPause(false)
        console.log('Pause')
        // socket.current.close()
    }


    const resumeFileData = (event) => {
        pause.current = false
        setIsResume(false)
        setIsPause(true)
        sendNextChunk();
    }


    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    async function getUsers() {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/userwid/${id_user}/`)
        setUsers(response.data)
    }

    async function getFiles(id) {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/send_rec/${id_user}_${id}/`)
        setFiles(response.data)
    }

    async function getFiles2(id) {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/send_rec/${id}_${id_user}/`)
        setFiles2(response.data)
    }

    async function getUsersById(id) {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/user/${id}/`)
        setMe(response.data)
    }

    async function getSelUserById(id) {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/user/${id}/`)
        setSelectedUser(response.data)
    }

    const drawer = (
        <div>
            <div className='top_info'>
                <div className='top_text'>
                    <div className='top_name_surname'>
                        {me.name} {me.surname}<br></br>
                    </div>
                    {me.telephone}
                </div>
                <div className='top_buttons'>
                    <Button variant="outlined" color="error" onClick={() => {
                        localStorage.clear();
                        navigate("/login");
                    }}>
                        Logout
                    </Button>
                </div>
            </div>
            <Toolbar />
            <List>
                {users.map((good) => (
                    <ListItem key={good.id} >
                        <ListItemButton onClick={() => {
                            setSelectedUserId(good.id)
                            localStorage.setItem('selected_user', good.id)
                        }}>
                            <ListItemIcon>
                                <pre className='toolbar_block'>
                                    <div className='toolbar_icon'>
                                        <AccountCircleIcon />
                                    </div>
                                    <div className='toolbar_names'>
                                        <p className='toolbar_name'>
                                            {good.name} {good.surname}
                                        </p>
                                    </div>
                                </pre>
                            </ListItemIcon>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        File flow
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <br></br>
                <br></br>
                {selectedUser
                    ?
                    <p>
                        {selectedUser.name} {selectedUser.surname}
                    </p>
                    :
                    <div>

                    </div>
                }
                <div className='chat_files'>
                    <div className='chat_my_files'>
                        {selectedUserId
                            ?
                            <p>Ваши отправленные файлы</p>
                            :
                            <div>

                            </div>
                        }
                        {files.map((good) => (
                            <div>
                                {good.file_name}
                                <a href={`http://127.0.0.1:9000/fileflow/${good.file_name}`} download>
                                    <Button>
                                        Скачать {good.size} байт
                                    </Button>
                                </a>
                            </div>
                        ))}
                        <br></br>
                    </div>
                    <div className='chat_received_files'>
                        {selectedUserId
                            ?
                            <p>Полученные файлы</p>
                            :
                            <div>

                            </div>
                        }
                        {files2.map((good) => (
                            <div>
                                {good.file_name}
                                <a href={`http://127.0.0.1:9000/fileflow/${good.file_name}`} download>
                                    <Button>
                                        Скачать {good.size} байт
                                    </Button>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                {selectedUserId
                    ?
                    <div className='chat_progress'>
                        <input onChange={onFileChange} type="file" className='chat_file'></input>
                        <div className='chat_progress_buttons'>
                            {isUpload
                                ?
                                <button className='upload_button' disabled={!file} onClick={uploadFileData}>Upload</button>
                                :
                                <div className='chat_text'></div>
                            }
                            {isPause
                                ?
                                <button className='upload_button' disabled={!file} onClick={pauseFileData}>Pause</button>
                                :
                                <div className='chat_text'></div>
                            }
                            {isResume
                                ?
                                <button className='upload_button' disabled={!file} onClick={resumeFileData}>Resume</button>
                                :
                                <div className='chat_text'></div>
                            }
                        </div>
                        {percentage == 0 || percentage == 100
                            ?
                            <div>
                            </div>
                            :
                            <div>
                                <ProgressBar bgcolor="#6a1b9a" completed={percentage} />
                            </div>
                        }
                    </div>
                    :
                    <div className='chat_0'>
                        Выберите, кому хотели бы написать
                    </div>
                }
            </Box>
        </Box>
    );
}
