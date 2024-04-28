import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
// const axios = require('axios')
// const FormData = require('form-data')
// import { create as ipfsHttpClient } from 'ipfs-http-client'
// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState('');
  const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3Mzc2YTNlYy1mMjQ1LTQ2OTUtOTdmYS0yMjhjYTg4ZDg2YmYiLCJlbWFpbCI6InBhdGVsdGFuaXNoYTA0MDkyMDAyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkNGViZTIxMmFhMmU1ZWQ5MGEzNyIsInNjb3BlZEtleVNlY3JldCI6ImJkMmY5OWRlZTJkN2I0N2NkMDFjYjZmOWJlNjAyOGI2ZjhiMTBlYzNjOGVhZmY2NGY1MTM1ZTQ4ZWE0YWU5NWYiLCJpYXQiOjE3MTQzMDA1MjF9.ZkSZMZPLGF493KW7iT3G5jYgYJeU0jms9PQ34wmTZ_A'
  // const uploadToIPFS = async (event) => {
  //   event.preventDefault()
  //   const file = event.target.files[0]
  //   if (typeof file !== 'undefined') {
  //     try {
  //       const result = await client.add(file)
  //       console.log(result)
  //       setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
  //     } catch (error){
  //       console.log("ipfs image upload error: ", error)
  //     }
  //   }
  // }
  const upLoadToPinata = async(file) =>{
    if(file){
      try{
        setSelectedFile(file.target.files[0]);
        console.log(selectedFile, "+h+")
        console.log("file loaded")
        // const formData = new FormData();
        // formData.append("file", file);

        // const response = await fetch({
        //   method : "POST",
        //   url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        //   data: formData,
        //   headers: {
        //     pinata_api_key: `6cc361598b7b46f62f26`,
        //     pinata_secret_api_key: `54b7cdd068c3db68e9fffe90bafa5e56a92e4252a838b8c124e11bf4cc571f47`,
        //     "Content-Type": "multipart/form-data",
        //   }
        // });
        // const ImgHash = `https://violet-key-lamprey-665.mypinata.cloud/${response.data.IpfsHash}`;
        // setImage(ImgHash);
        // console.log(ImgHash);
        // // return ImgHash;
  
      } catch(error){
          console.log("Unable to upload image to Pinata");
      }
    }
  }

  const createNFT = async () => {
    console.log(image, "+h+", price, "+h+", name, "+h+", description, "+h+")
    // if (!image || !price || !name || !description){
    //   console.log("details not filled");
    //   return ;
    // }
    const data = JSON.stringify({price, name, description});
    try{
      const formData = new FormData();
      formData.append("file", selectedFile);
      // const metadata = JSON.stringify({
      //   name: "File name",
      // });
      formData.append("pinataMetadata", data);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      console.log(formData);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      console.log(resData);
      console.log(formData.entries)
      mintThenList(resData.IpfsHash)
      // mintThenList(resData.image)
      // const response = await fetch({
      //   method: "POST",
      //   url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      //   data: data,
      //   headers: {
      //     pinata_api_key: `6cc361598b7b46f62f26`,
      //     pinata_secret_api_key: `54b7cdd068c3db68e9fffe90bafa5e56a92e4252a838b8c124e11bf4cc571f47`,
      //     "Content-Type": "multipart/form-data",
      //   }
      // });
      // const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      // console.log(url);
      // mintThenList(url);
    }catch(error) {
        console.log("ipfs uri upload error: ", error)
    }
    // try{
    //   const result = await client.add(data)
    //   mintThenList(result)
    // } catch(error) {
    //   console.log("ipfs uri upload error: ", error)
    // }
  }
  const mintThenList = async (result) => {
    const uri = `https://violet-key-lamprey-665.mypinata.cloud/ipfs/${result}`
    console.log(uri);
    // // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    console.log(id._hex);
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    console.log(listingPrice._hex);
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={upLoadToPinata}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create