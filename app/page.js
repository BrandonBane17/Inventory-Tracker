"use client"
import {Box, Stack, Typography, Button, Modal, TextField } from "@mui/material"
import {firestore} from '@/firebase'
import { collection, query, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { useEffect, useState } from "react"

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
export default function Home() {
    const [pantry, setPantry] = useState([])
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [itemName, setItemName] = useState('')
    const updatePantry = async () => {
      const snapshot = query(collection(firestore, 'pantry'))
      const docs = await getDocs(snapshot)
      const pantryList = []
      docs.forEach((doc) => {
        pantryList.push(doc.id)
      })
      console.log(pantryList)
      setPantry(pantryList)
    }
    useEffect(() => {
      updatePantry()
    }, [])

  const addItem = async (item) => {
    console.log('Adding Item:', item)
    const docRef = doc(collection(firestore, 'pantry'), item)
    await setDoc(docRef, {})
    await updatePantry()
  }

  const removeItem = async (item) => {
    console.log('Removing Item:', item)
    const docRef = doc(collection(firestore, 'pantry'), item)
    await deleteDoc(docRef)
    await updatePantry()
  }
  return <Box 
    width="100vw" height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction={'row'} spacing={2}>
          <TextField id="standard-basic" label="Item" variant="standard" fullWidth value={itemName} 
            onChange={(e) => setItemName(e.target.value)}/>
          <Button variant="contained"
            onClick={() => {addItem(itemName), setItemName(''), handleClose()}}>Add</Button>
        </Stack>
        </Box>
      </Modal>

      <Button variant="contained" onClick={handleOpen}>Add Item</Button>
      <Box border={'1px solid #333'}>
      <Box width="800px" height="100px" bgcolor={'#72f5ac'} 
            display={'flex'} justifyContent={'center'} alignItems={'center'} >
        <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
          Pantry Items
        </Typography> 

      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow={'auto'} >

      {pantry.map((i) => (
        <Box
          key={i}
          width="100%"
          minHeight="150px"
          bgcolor="#f0f0f0"
          display="flex"
          justifyContent="space-between"
          paddingX={3}
          alignItems="center"
        >
          <Typography
            variant="h3"
            color="#333"
            flexGrow={1}
            textAlign="center"
            ml={15}
          >
            {i.charAt(0).toUpperCase() + i.slice(1)}
          </Typography>
          <Box flexShrink={0} ml={3}>
            <Button variant="contained" onClick={() => removeItem(i)}>
              Remove
            </Button>
          </Box>
        </Box>
      ))}
      </Stack>
      </Box>
    </Box>

  
}
