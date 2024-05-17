const Product = require('../models/product');

module.exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                pageTitle: 'Shop',
                path: '/',
                products: products
            });
        })
        .catch(err => {
            console.log(err);
        })
    // Product.fetchAll()
    //     .then(([rows]) => {
    //         res.render('shop/index', {
    //             pageTitle: 'Shop',
    //             path: '/',
    //             products: rows
    //         });
    //     })
    //     .catch(err => console.log(err));
};

module.exports.getProducts = (req, res, next) => {
    // Product.fetchAll()
    //     .then(([rows]) => {
    //         res.render('shop/product-list', {
    //             pageTitle: 'All Products',
    //             path: '/products',
    //             products: rows
    //         });
    //     })
    //     .catch(err => console.log(err));

    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                pageTitle: 'All Products',
                path: '/products',
                products: products
            });
        })
        .catch(err => {
            console.log(err);
        })
};

module.exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    // Product.findById(productId)
    //     .then(([product]) => {
    //         console.log('product -=-=-=->', product);
    //         res.render('shop/product-details', {
    //             pageTitle: product[0].title,
    //             path: '/products',
    //             product: product[0]
    //         });
    //     })
    //     .catch(err => console.log(err));

    Product.findByPk(productId)
        .then((product) => {
            console.log('product -=-=-=->', product);
            res.render('shop/product-details', {
                pageTitle: product.title,
                path: '/products',
                product: product
            });
        })
        .catch(err => console.log(err));
};

module.exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products: products
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err))
    // Cart.fetchAll(cart => {
    //     Product.fetchAll(products => {
    //         const newProducts = [];
    //         for (let product of products) {
    //             let cartProductData = cart.products.find(prod => prod.id === product.id);
    //             if (cartProductData) {
    //                 newProducts.push({ ...product, quantity: cartProductData.quantity });
    //             }
    //         }
    //         const newCart = {
    //             products: newProducts,
    //             totalPrice: cart.totalPrice
    //         };
    //         res.render('shop/cart', {
    //             pageTitle: 'Your Cart',
    //             path: '/cart',
    //             cart: newCart
    //         });
    //     });
    // });
};

module.exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart
                .getProducts({
                    where: { id: productId }
                });
        })
        .then(products => {
            const product = products[0];
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            } else {
                return Product
                    .findByPk(productId);
            }
        })
        .then(product => {
            return fetchedCart
                .addProduct(product, {
                    through: {
                        quantity: newQuantity
                    }
                });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

module.exports.postDeleteCartProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: prodId } })
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err))
    // Product.fetch(req.body.productId, product => {
    //     Cart.removeProduct(product.id, product.price, err => {
    //         if (!err) {
    //             res.redirect('/cart');
    //         }
    //     });
    // });
};

module.exports.getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err))
};

module.exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};

module.exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product
                    }));
                })
                .catch(err => console.log(err));
        })
        .then(() => {
            return fetchedCart.setProducts(null);
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err))
}

