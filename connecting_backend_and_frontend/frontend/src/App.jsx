import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import Card from './components/Card'

function App() {
  const [product, setProduct] = useState([])

  useEffect(() => {
    axios
        .get('/api/product')
        .then(response => {
            setProduct(response.data)
            console.log(response.data)
        })
        .catch(error => {
            console.log(error)
        })
  }, [])
  

  return (
      <>
          <h1>Number of Products: {product.length}</h1>

          {product.map((item) => (
              <div className="mt-4 flex justify-center" key={item.id}>
                  <Card
                      title={item.product_item}
                      description={item.product_description}
                  />
              </div>
          ))}
      </>
  )
}

export default App
