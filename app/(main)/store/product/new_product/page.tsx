
import React from 'react';
import Card from '../product_card/card';

const products = [
    {
        img: "/sports-1.jpg",
        title: "Sports",
        desc: "Trekking & Running Shoes - Black",
        rating: 3,
        price: "58.00",
    },
    {
        img: "/fashion-1.jpg",
        title: "Fashion",
        desc: "Men's Casual Shirt - Blue",
        rating: 4,
        price: "35.00",
    },
    {
        img: "/electronics-1.jpg",
        title: "Electronics",
        desc: "Wireless Bluetooth Headphones",
        rating: 5,
        price: "120.00",
    },
    {
        img: "/home-1.jpg",
        title: "Home & Kitchen",
        desc: "Non-Stick Cookware Set - 5 Pcs",
        rating: 4,
        price: "75.00",
    },
    {
        img: "/books-1.jpg",
        title: "Books",
        desc: "The Art of Programming - Volume 1",
        rating: 5,
        price: "45.00",
    }
];

const NewProduct = () => {
    return <div><div className='container pt-16'>
        <h2 className='font-medium text-2x1 pb-4'>
        New Products
        </h2>
        <div className='grid grid-cols-1 place-items-center sm:place-items-start 
        sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-x-20 xl:gap-y-10'>
        {products.map((item, index) => (
            <Card
            key={index}
            img={item.img}
            title={item.title}
            desc={item.desc}
            rating={item.rating}
            price={item.price}
        
        />))}

        </div>
    </div></div>;
};

export default NewProduct;