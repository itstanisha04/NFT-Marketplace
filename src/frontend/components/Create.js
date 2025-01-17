import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'

const createMetaData = (name, description, price, ipfsHash) => {
  // Construct the metadata object
  const metaData = {
    name: name,
    description: description,
    image: `https://violet-key-lamprey-665.mypinata.cloud/ipfs/${ipfsHash}`,
    price: price
  };
  const metaDataJson = JSON.stringify(metaData, null, 2);
  try{
    localStorage.setItem(`metadata_${ipfsHash}`, metaDataJson);
    console.log(`metadata for nft ${ipfsHash} stored successfully`);
  }catch(err){
    console.error("error writing in local storage");
  }
};

const Create = ({ marketplace, nft }) => {
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState('');
  const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3Mzc2YTNlYy1mMjQ1LTQ2OTUtOTdmYS0yMjhjYTg4ZDg2YmYiLCJlbWFpbCI6InBhdGVsdGFuaXNoYTA0MDkyMDAyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkNGViZTIxMmFhMmU1ZWQ5MGEzNyIsInNjb3BlZEtleVNlY3JldCI6ImJkMmY5OWRlZTJkN2I0N2NkMDFjYjZmOWJlNjAyOGI2ZjhiMTBlYzNjOGVhZmY2NGY1MTM1ZTQ4ZWE0YWU5NWYiLCJpYXQiOjE3MTQzMDA1MjF9.ZkSZMZPLGF493KW7iT3G5jYgYJeU0jms9PQ34wmTZ_A'

  const upLoadToPinata = async(file) =>{
    if(file){
      try{
        setSelectedFile(file.target.files[0]);
        console.log("file loaded")
      } catch(error){
          console.log("Unable to upload image to Pinata");
      }
    }
  }

  const createNFT = async () => {
    try{
      const formData = new FormData();
      formData.append("file", selectedFile);
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

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
      if (!res.ok) {
        console.error('Upload to pinata failed');
        return;
      }
      const resData = await res.json();
      const ipfsHash = resData.IpfsHash;
      
      createMetaData(name, description, price, ipfsHash);

      mintThenList(ipfsHash)
      
    }catch(error) {
        console.log("ipfs uri upload error: ", error)
    }
  }

  const mintThenList = async (result) => {
    const uri = `https://violet-key-lamprey-665.mypinata.cloud/ipfs/${result}`
    console.log("URI ", uri)

    try{
      const minTx = await( await nft.mint(uri))
    }catch(err){
      console.log("pblm in minting", err.message);
    }
    try{
      const id = await nft.tokenCount()
      console.log("id: ", id._hex);
      // approve marketplace to spend nft
      await(await nft.setApprovalForAll(marketplace.address, true)).wait()
      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther(price.toString())
      await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    }catch(err){
      console.log("error: ", err.message);
    }
    alert("NFT Created.")
    console.log("Minting completed");
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
