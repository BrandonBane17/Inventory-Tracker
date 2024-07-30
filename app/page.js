"use client"
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from "@mui/material"
import { Add, Remove } from '@mui/icons-material';
import { firestore } from '@/firebase'
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from "react"
import axios from 'axios'

// Access the environment variable
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_API_TOKEN;

// Log the API key to ensure it's being read correctly
console.log("Unsplash API Key:", UNSPLASH_ACCESS_KEY);

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    console.log(pantryList);
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const fetchImage = async (item) => {
    console.log("Fetching image for:", item); // Log the item being fetched
    try {
      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: { query: `Singular whole ${item}`, per_page: 2 },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });
      console.log("Unsplash API response:", response.data); // Log the API response
      if (response.data.results.length > 1) {
        return response.data.results[1].urls.small;
      } else if (response.data.results.length > 0) {
        return response.data.results[0].urls.small;
      }
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
    }
    return null; // Return null if no image found or error occurred
  };

  const addItem = async (item) => {
    item = item.toLowerCase();
    console.log('Adding Item:', item);
    const image = await fetchImage(item);
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1, image: image });
    } else {
      await setDoc(docRef, { count: 1, image: image });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    console.log('Removing Item:', item);
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }
    await updatePantry();
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
        backgroundColor: '#e0f7e0',  // Lighter green background
      }}
      p={4}
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
                addItem(itemName);
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
      <Box
        width="800px"
        mt={4}
        borderRadius={2}
        overflow="hidden"
        boxShadow={3}
        bgcolor="white"
      >
        <Box
          width="100%"
          height="100px"
          bgcolor="#4caf50"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          position="relative"
        >
          <Typography variant="h2" color="white" textAlign="center" ml={22}>
            Pantry Items
          </Typography>
          <Box position="absolute" right={16}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpen}
              sx={{ bgcolor: "#4caf50", '&:hover': { bgcolor: "#388e3c" } }}
            >
              Add Item
            </Button>
          </Box>
        </Box>

        <Stack
          width="100%"
          height="300px"
          spacing={2}
          overflow="auto"
          p={2}
          bgcolor="#fafafa"
        >
          {pantry.map(({ name, count, image }) => (
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
            >
              <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1} ml={2}>
                {image && (
                  <img src={image} alt={name} style={{ width: 50, height: 50, marginRight: 16, borderRadius: '50%' }} />
                )}
                <Typography variant="h5" color="#333" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="body1" color="#555" mx={2}>
                  Qty: {count}
                </Typography>
                <IconButton color="secondary" onClick={() => removeItem(name)}>
                  <Remove />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
