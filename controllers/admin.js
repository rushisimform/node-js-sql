const Product = require('../models/product');

module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const descripiton = req.body.description;

    // const product = new Product(null, title, imageUrl, descripiton, price);

    // product
    //     .save()
    //     .then(() => {
    //         res.redirect('/');
    //     })
    //     .catch(err => console.log(err));
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: descripiton
    })
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err)
        })
};

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};


module.exports.getEditProduct = (req, res, next) => {
    // fetch the specific product details
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    const productId = req.params.productId;
    // Product.fetch(productId, product => {
    //     if (!product) res.redirect('/');
    //     res.render('admin/edit-product', {
    //         pageTitle: 'Edit Product',
    //         path: '/products',
    //         editing: editMode,
    //         product: product
    //     });
    // });
    req.user.getProducts({ where: { id: productId } })
        // Product.findByPk(productId)
        .then(products => {
            const product = products[0];
            if (!product) res.redirect('/');
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/products',
                editing: editMode,
                product: product
            });
        })
        .catch(err => console.log(err));
};

module.exports.postEditProduct = (req, res, next) => {
    // const product = new Product(
    //     req.body.id,
    //     req.body.title,
    //     req.body.imageUrl,
    //     req.body.description,
    //     req.body.price
    // );
    // product.save();
    Product.findByPk(req.body.id)
        .then(product => {
            product.title = req.body.title;
            product.imageUrl = req.body.imageUrl;
            product.description = req.body.description;
            product.price = req.body.price;
            return product.save();
        })
        .then(result => {
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

module.exports.getProducts = (req, res, next) => {
    // Product.fetchAll((products) => {
    //     res.render('admin/product-list', {
    //         pageTitle: '',
    //         path: '/admin/products',
    //         products: products
    //     });
    // });
    req.user.getProducts()
        // Product.findAll()
        .then(products => {
            res.render('admin/product-list', {
                pageTitle: '',
                path: '/admin/products',
                products: products
            });
        })
        .catch(err => {
            console.log(err)
        });
};

module.exports.postDeleteProduct = (req, res, next) => {
    // Product.delete(req.body.productId);
    // res.redirect('/admin/products');
    Product.findByPk(req.body.productId)
        .then(product => {
            return product.destroy()
        })
        .then(result => {
            console.log('DESTROYED PRODUCT !!')
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
};