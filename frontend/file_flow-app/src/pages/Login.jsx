import React, { useEffect, useState } from 'react';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Login = () => {
    let navigate = useNavigate()
    const [log, setLog] = useState('');
    const [pass, setPass] = useState('');
    const [user, setUser] = useState([]);

    async function getUsers() {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/user/`)
        setUser(response.data)
    }

    

    async function postUser(username, password) {
        for (let index = 0; index < user.length; index++) {
            const l = user[index].login;
            const p = user[index].password;
            if (log == 'artem') {
                localStorage.setItem('admin', '1')
            }
            if (l == log && p == pass) {
                localStorage.setItem('auth', 'true')
                localStorage.setItem('id_user', `${user[index].id}`)
                navigate("/main")
                break;
            }
        }
    }

    useEffect(() => {
        getUsers()
    }, []);


    const login = event => {
        event.preventDefault();
        postUser(log, pass)
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="login"
                        label="Login"
                        color="secondary"
                        sx={{ input: { color: 'white' } }}
                        onChange={event => setLog(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        sx={{ input: { color: 'white' } }}
                        autoComplete="current-password"
                        onChange={event => setPass(event.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={login}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link href="/signup" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;
