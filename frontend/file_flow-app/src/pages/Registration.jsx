import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Registration = () => {
    const theme = createTheme();

    const navigate = useNavigate()
    const [username, setUsername] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [users, setUsers] = useState([]);

    async function getUsers() {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/user/')
        setUsers(response.data)
    }

    useEffect(() => {
        getUsers()
    }, []);

    async function PostToUser(login, password, name, surname, telephone) {
        await axios.post('http://127.0.0.1:8000/api/v1/user/',
            {
                login: `${login}`,
                password: `${password}`,
                name: `${name}`,
                surname: `${surname}`,
                telephone: `${telephone}`,
            })
    }

    const reg = event => {
        for (let index = 0; index < users.length; index++) {
            const l = users[index].login;
            if (l == username) {
            } else {
                PostToUser(username, pass, name, surname, phone)
                navigate("/login")
                break;
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
    };
    return (
        <div>
            <ThemeProvider theme={theme}>
                <Container component="main" maxWidth="sm">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: 3,
                            borderRadius: 2,
                            px: 4,
                            py: 6,
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="given-name"
                                        name="firstName"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        sx={{ input: { color: 'white' } }}
                                        autoFocus
                                        onChange={event => setName(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        sx={{ input: { color: 'white' } }}
                                        autoComplete="family-name"
                                        onChange={event => setSurname(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="login"
                                        label="Login"
                                        type="login"
                                        sx={{ input: { color: 'white' } }}
                                        id="login"
                                        autoComplete="new-login"
                                        onChange={event => setUsername(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        sx={{ input: { color: 'white' } }}
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        onChange={event => setPass(event.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="telephone"
                                        label="Telephone number"
                                        sx={{ input: { color: 'white' } }}
                                        name="telephone"
                                        autoComplete="telephone"
                                        onChange={event => setPhone(event.target.value)}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={reg}
                            >
                                Sign Up
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/login" variant="body2">
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
}

export default Registration;
