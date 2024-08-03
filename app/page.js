"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from "@mui/material";
import { Add, Remove, Search, CameraAlt } from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import Draggable from "react-draggable";
import axios from 'axios';
import { updateInventory, addItem, removeItem, increaseItemCount } from "./inventoryUtils";
import "react-resizable/css/styles.css"; 
import './globals.css';
import * as dotenv from 'dotenv';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};
export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [itemName, setItemName] = useState('');


  useEffect(() => {
    const fetchInventory = async () => {
      const inventoryList = await updateInventory();
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const handleAddItem = async (item) => {
    await addItem(item);
    const inventoryList = await updateInventory();
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const handleRemoveItem = async (item) => {
    await removeItem(item);
    const inventoryList = await updateInventory();
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const handleIncreaseItemCount = async (item) => {
    await increaseItemCount(item);
    const inventoryList = await updateInventory();
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const handleCameraOpen = () => {
    setCameraOpen(true);

    // Try to access the back camera first
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }
    })
    .then(stream => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Listen for the video element to be ready before playing
            videoRef.current.onloadeddata = () => {
                videoRef.current.play().catch(error => {
                    console.error("Error playing video:", error);
                });
            };
        }
    })
    .catch(err => {
        console.error("Error accessing the back camera: ", err);
        
        //Fallback to the front camera or any available camera
        return navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
        });
    })
    .then(stream => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
                videoRef.current.play().catch(error => {
                    console.error("Error playing video:", error);
                });
            };
        }
    })
    .catch(err => {
        console.error("Final fallback error: ", err);
        alert("Unable to access camera.");
    });
};


  
const handleCapture = async () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/png');
  setCapturedImage(imageData);

  try {
      const response = await axios.post('/api/analyze_image', { imageData });
      const result = response.data.result;
      handleAddItem(result);
  } catch (error) {
      console.error("Error analyzing the image: ", error);
  }

  handleCameraClose();
};

  const handleCameraClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraOpen(false);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{
        backgroundColor: '#e0f7e0',
        p: 2, // Adjusted padding for mobile
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
        <Typography 
          variant="h3"
          color="#4caf50"
        >
          Inventory Tracker
        </Typography>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Add Item
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              id="standard-basic"
              label="Item"
              variant="standard"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                handleAddItem(itemName);
                setItemName('');
                handleClose();
              }}
              sx={{ bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={{ ...modalStyle, width: '100%', maxWidth: 600}}>
          <Typography id="camera-modal-title" variant="h6" component="h2" gutterBottom>
            Take a Picture
          </Typography>
          <video ref={videoRef} autoPlay style={{ width: '100%' }} />
          <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
            <Button variant="contained" onClick={handleCapture} 
              sx={{ bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}>
                Capture
              </Button>
            <Button variant="outlined" onClick={handleCameraClose} sx={{
              color: "#4caf50", 
              borderColor: "#4caf50",'&:hover': {borderColor: "#388e3c", color: "#388e3c", backgroundColor: "transparent",},
                }}>Close</Button>
          </Stack>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
      </Modal>

      {capturedImage && (
        <Box mt={2}>
          <Typography variant="h6" color="#4caf50">Captured Image:</Typography>
          <img src={capturedImage} alt="Captured" style={{ width: '100%', maxWidth: 200 }} />
        </Box>
      )}

      <Draggable handle=".drag-handle" cancel=".no-drag, .MuiButtonBase-root, .MuiInputBase-root">
        <ResizableBox
          width={360}
          height={465}
          minConstraints={[320, 220]}
          maxConstraints={[1200, 800]}
          resizeHandles={['se']}
          handleSize={[20, 20]}
          className="custom-resizable-box"
        >
          <Box
            width="100%"
            height="100%"
            borderRadius={2}
            overflow="hidden"
            boxShadow={3}
            bgcolor="white"
            display="flex"
            flexDirection="column"
          >
            <Box
              width="100%"
              height="100px"
              bgcolor="#4caf50"
              display="flex"
              alignItems="center"
              px={2}
              flexWrap="nowrap"
            >
              <Box display="flex" alignItems="center" mx={0}>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt/>}
                  onClick={handleCameraOpen}
                  sx={{ bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" }}}
                  
                >
                  Scan Item
                </Button>
              </Box>

              <Box width="30%" mx={1}>
                <TextField
                  variant="standard"
                  fullWidth
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: 'white', mr: 1 }} />
                    ),
                    disableUnderline: false
                  }}
                  sx={{
                    '& .MuiInput-root': {
                      color: 'white',
                    },
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'white',
                    },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                      borderBottomColor: 'white',
                    },
                    flexShrink: 1,
                    minWidth: '100px',
                  }}
                />
              </Box>

              <Box display="flex" alignItems="center" ml={2}>
                <Button
                  variant="contained"
                  onClick={handleOpen}
                  sx={{ bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" }, minWidth: '50px' }}
                >
                  Add Item
                </Button>
              </Box>
            </Box>

            <Stack
              width="100%"
              height="calc(100% - 100px)"
              spacing={2}
              overflow="auto"
              p={2}
              bgcolor="#fafafa"
              className="no-drag"
            >
              {filteredInventory.length > 0 ? (
                filteredInventory.map(({ name, count }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="100px"
                    bgcolor="#f0f0f0"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    borderRadius={2}
                    boxShadow={1}
                    sx={{
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      overflow: 'visible', 
                      minHeight: '100px',
                      height: 'auto',
                      flexDirection: 'column',
                    }}
                  >
                    <Box display="flex" alignItems="center" flexGrow={1} ml={2} >
                      <Typography variant="h5" color="#333">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1} >
                      <Typography variant="body1" color="#555" mx={2}>
                        Qty: {count}
                      </Typography>
                      <IconButton sx={{ color: 'red' }} onClick={() => handleRemoveItem(name)}>
                        <Remove />
                      </IconButton>
                      <IconButton sx={{ color: 'green' }} onClick={() => handleIncreaseItemCount(name)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="h6" color="textSecondary" textAlign="center" mt={2}>
                  No items found
                </Typography>
              )}
            </Stack>
            <Box
              className="drag-handle"
              sx={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                width: 20,
                height: 20,
                backgroundColor: '#4caf50',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'move',
                zIndex: 10,
              }}
            >
              <Box sx={{ width: '70%', height: '70%', backgroundColor: '#fff', borderRadius: '50%' }} />
            </Box>
          </Box>
        </ResizableBox>
      </Draggable>
    </Box>
  );
}
