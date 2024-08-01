"use client";

import { useEffect, useState } from "react";
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from "@mui/material";
import { Add, Remove, Search } from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import Draggable from "react-draggable";
import { updateInventory, addItem, removeItem, increaseItemCount } from "./inventoryUtils";
import "react-resizable/css/styles.css"; 
import './globals.css';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Adjusted for mobile
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
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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

      <Draggable cancel=".react-resizable-handle">
        <ResizableBox
          width={800}
          height={500}
          minConstraints={[300, 200]}
          maxConstraints={[1200, 800]}
          resizeHandles={['se']}
          handleSize={[20, 20]}
          className="custom-resizable-box" // Apply your custom class here
        >
          <Box
            width="100%"
            height="100%"
            mt={4}
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
            >
              <Typography 
                variant="h4" 
                color="white"
                flexGrow={1}  // Use flexGrow to let this take up remaining space
              >
                Inventory
              </Typography>

              <Box width="40%" mx={2}>  {/* Centered Search Bar */}
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
                  }}
                />
              </Box>

              <Box>
                <Button
                  variant="contained"
                  onClick={handleOpen}
                  sx={{ bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
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
          </Box>
        </ResizableBox>
      </Draggable>
    </Box>
  );
}
