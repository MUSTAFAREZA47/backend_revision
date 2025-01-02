import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [product, setProduct] = useState([])

  useEffect(() => {
    axios
        .get('/api/product')
        .then(response => {
            setProduct(response.data)
            console.log(response.data)
        })
        .catch(response => {
            console.log(error)
        })
  }, [])
  

  return (
      <>
          <h1>Number of Products: {product.length}</h1>

          {product.map((item) => (
              <div key={item.id}>
                  <h2>{item.product_item}</h2>
                  <p>{item.product_description}</p>
              </div>
          ))}
      </>
  )
}

export default App
