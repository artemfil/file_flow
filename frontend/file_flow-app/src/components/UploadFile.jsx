import React from 'react';
import { useState } from 'react';
import '../styles/upload.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useRef } from 'react';
import { useEffect } from 'react';



const UploadFile = (sender, recipient) => {
	const socket = useRef()

	useEffect(() => {
		socket.current = new W3CWebSocket("ws://127.0.0.1:8000/ws/chat/test/")

		socket.current.onopen = () => {
		}
		socket.current.onmessage = (event) => {
			const message = JSON.parse(event.data)
			console.log(message)
		}
		socket.current.onclose = () => {
			console.log('Socket закрыт')
		}
		socket.current.onerror = () => {
			console.log('Socket произошла ошибка')
		}
	}, []);
	const [file, setFile] = useState('');
	const request_id = new Date().getTime()
	const onFileChange = (event) => {
		setFile(event.target.files[0])
	}

	const uploadFileData = (event) => {
		event.preventDefault();
		socket.send(JSON.stringify({
			action: "create",
			request_id: request_id,
			data:{
				sender: sender,
				recipient: recipient,
				file: file,
			}
		}));
	}
	return (
		<div id="container">
			<input onChange={onFileChange} type="file"></input>
			<button disabled={!file} onClick={uploadFileData}>Upload</button>
		</div>
	);
}

export default UploadFile;