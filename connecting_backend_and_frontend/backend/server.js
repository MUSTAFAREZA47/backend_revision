import 'dotenv/config'
import express from 'express'

const app = express()

const PORT = process.env.PORT || 3000

app.get('/api/product', (req, res) => {
    let dummyData = [
        {
            id: 1,
            product_item: 'Wireless Bluetooth Headphones',
            product_description:
                'High-quality over-ear headphones with noise cancellation and 30 hours of battery life.',
        },
        {
            id: 2,
            product_item: 'Smartphone Stand',
            product_description:
                'Adjustable aluminum stand compatible with most smartphones and tablets.',
        },
        {
            id: 3,
            product_item: 'LED Desk Lamp',
            product_description:
                'Energy-efficient desk lamp with adjustable brightness and touch controls.',
        },
        {
            id: 4,
            product_item: 'Stainless Steel Water Bottle',
            product_description:
                'Durable and insulated water bottle that keeps drinks hot or cold for hours.',
        },
        {
            id: 5,
            product_item: 'Portable Power Bank',
            product_description:
                '10,000mAh power bank with dual USB ports and fast-charging capabilities.',
        },
        {
            id: 6,
            product_item: 'Fitness Tracker',
            product_description:
                'Waterproof fitness tracker with heart rate monitoring and step counting.',
        },
        {
            id: 7,
            product_item: 'Wireless Keyboard',
            product_description:
                'Compact and lightweight Bluetooth keyboard compatible with multiple devices.',
        },
        {
            id: 8,
            product_item: 'Gaming Mouse',
            product_description:
                'High-precision optical gaming mouse with customizable buttons and RGB lighting.',
        },
        {
            id: 9,
            product_item: 'Ceramic Coffee Mug',
            product_description:
                'Microwave-safe ceramic coffee mug with a 350ml capacity and stylish design.',
        },
        {
            id: 10,
            product_item: 'Noise-Canceling Earbuds',
            product_description:
                'In-ear wireless earbuds with active noise cancellation and a charging case.',
        },
    ]
    res.send(dummyData)
})

app.listen(PORT, () => {
    console.log(`app listening on http://localhost:${PORT}`)
})