import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3Mzc2YTNlYy1mMjQ1LTQ2OTUtOTdmYS0yMjhjYTg4ZDg2YmYiLCJlbWFpbCI6InBhdGVsdGFuaXNoYTA0MDkyMDAyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkNGViZTIxMmFhMmU1ZWQ5MGEzNyIsInNjb3BlZEtleVNlY3JldCI6ImJkMmY5OWRlZTJkN2I0N2NkMDFjYjZmOWJlNjAyOGI2ZjhiMTBlYzNjOGVhZmY2NGY1MTM1ZTQ4ZWE0YWU5NWYiLCJpYXQiOjE3MTQzMDA1MjF9.ZkSZMZPLGF493KW7iT3G5jYgYJeU0jms9PQ34wmTZ_A'

const fetchMetaData = (ipfsHash) => {
  const metaDataJson = localStorage.getItem(`metadata_${ipfsHash}`);

  if(!metaDataJson){
    console.log(`no metadata found for NFT ${ipfsHash}`);
    return null;
  }
  try{
    const metaData = JSON.parse(metaDataJson);
    return metaData;
  }catch(err){
    console.error('error parsing metadata from localstorage: ', err);
    return null;
  }
};

const Home = ({ marketplace, nft }) => {
 
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await marketplace.itemCount()
    console.log("Itemcount: ",itemCount); 
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);

      if(!item.sold){
        const uri = await nft.tokenURI(item.tokenId)
        const parts = uri.split("/");
        const ipfsHash = parts[parts.length - 1];
        const metaData = fetchMetaData(ipfsHash);
        const totalPrice = await marketplace.getTotalPrice(item.itemId)
        items.push({
              totalPrice,
              itemId: item.itemId,
              seller: item.seller,
              name: metaData.name,
              description: metaData.desc,
              image: uri
        })
      }
    }
    setItems(items);
    setLoading(false);
    
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  const buyMarketItem = async (item) => {
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    alert("You bought an NFT")
    loadMarketplaceItems()
  }
  
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default Home
