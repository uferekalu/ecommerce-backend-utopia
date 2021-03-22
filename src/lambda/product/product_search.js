const handler = require('../../middleware/handler')
const db = require('../../lib/database/query')

//fake endpoint

const handler = require('../../middleware/handler')
exports.handler = async (event, context) => {
    const api_name = 'Product search'
    try {//TODO: This needs to be connected to the db. currently returns hard coded data    
        var data =
            [
                {
                    "id": 3,
                    "title": "Marshall Kilburn Portable Wireless Speaker",
                    "is_featured": false,
                    "is_hot": false,
                    "price": 42.99,
                    "sale_price": null,
                    "vendor": "Go Pro",
                    "review": 5,
                    "is_out_of_stock": false,
                    "depot": 85,
                    "inventory": 100,
                    "is_active": true,
                    "is_sale": false,
                    "slug": null,
                    "created_at": "2020-03-15T05:55:19.349Z",
                    "updated_at": "2020-03-15T05:55:19.349Z",
                    "variants": [],
                    "images": [
                        {
                            "id": 10,
                            "name": "1.jpg",
                            "alternativeText": null,
                            "caption": null,
                            "width": null,
                            "height": null,
                            "formats": null,
                            "hash": "3398b7a330154c9390db4495b9e3d413",
                            "ext": ".jpg",
                            "mime": "image/jpeg",
                            "size": 158.75,
                            "url": "/uploads/3398b7a330154c9390db4495b9e3d413.jpg",
                            "previewUrl": null,
                            "provider": "local",
                            "provider_metadata": null,
                            "created_at": "2020-03-15T05:55:19.403Z",
                            "updated_at": "2020-03-15T05:55:19.403Z"
                        },
                        {
                            "id": 11,
                            "name": "2.jpg",
                            "alternativeText": null,
                            "caption": null,
                            "width": null,
                            "height": null,
                            "formats": null,
                            "hash": "73b00542e06e4d008945bc701959472b",
                            "ext": ".jpg",
                            "mime": "image/jpeg",
                            "size": 44.03,
                            "url": "/uploads/73b00542e06e4d008945bc701959472b.jpg",
                            "previewUrl": null,
                            "provider": "local",
                            "provider_metadata": null,
                            "created_at": "2020-03-15T05:55:19.415Z",
                            "updated_at": "2020-03-15T05:55:19.415Z"
                        },
                        {
                            "id": 12,
                            "name": "3.jpg",
                            "alternativeText": null,
                            "caption": null,
                            "width": null,
                            "height": null,
                            "formats": null,
                            "hash": "f0647af5998446e1a6a1906996014a0a",
                            "ext": ".jpg",
                            "mime": "image/jpeg",
                            "size": 69.23,
                            "url": "/uploads/f0647af5998446e1a6a1906996014a0a.jpg",
                            "previewUrl": null,
                            "provider": "local",
                            "provider_metadata": null,
                            "created_at": "2020-03-15T05:55:19.425Z",
                            "updated_at": "2020-03-15T05:55:19.425Z"
                        }
                    ],
                    "thumbnail": {
                        "id": 9,
                        "name": "2.jpg",
                        "alternativeText": null,
                        "caption": null,
                        "width": null,
                        "height": null,
                        "formats": null,
                        "hash": "feaeaa8c5d24474e943f57a7df55e921",
                        "ext": ".jpg",
                        "mime": "image/jpeg",
                        "size": 15.15,
                        "url": "/uploads/feaeaa8c5d24474e943f57a7df55e921.jpg",
                        "previewUrl": null,
                        "provider": "local",
                        "provider_metadata": null,
                        "created_at": "2020-03-15T05:55:19.385Z",
                        "updated_at": "2020-03-15T05:55:19.385Z"
                    },
                    "product_categories": [
                        {
                            "id": 3,
                            "name": "Consumer Electrics",
                            "slug": "consumer-electrics",
                            "created_at": "2020-03-14T10:25:39.408Z",
                            "updated_at": "2020-03-14T10:25:39.408Z"
                        }
                    ],
                    "brands": [
                        {
                            "id": 2,
                            "name": "Marshall",
                            "slug": "marshall",
                            "created_at": "2020-03-14T10:31:31.138Z",
                            "updated_at": "2020-03-14T10:31:31.138Z"
                        }
                    ],
                    "collections": [
                        {
                            "id": 6,
                            "name": "Shop Recommend Items",
                            "slug": "shop-recommend-items",
                            "created_at": "2020-04-05T05:37:37.071Z",
                            "updated_at": "2020-04-05T05:37:49.638Z"
                        },
                        {
                            "id": 7,
                            "name": "Shop Top Deals Super Hot Today",
                            "slug": "shop-top-deals-super-hot-today",
                            "created_at": "2020-04-12T06:34:11.408Z",
                            "updated_at": "2020-08-05T09:09:03.737Z"
                        },
                        {
                            "id": 9,
                            "name": "New Arrivals Products",
                            "slug": "new-arrivals-products",
                            "created_at": "2020-04-12T06:36:23.687Z",
                            "updated_at": "2020-08-05T08:25:55.008Z"
                        },
                        {
                            "id": 20,
                            "name": "Customer Bought Products",
                            "slug": "customer-bought-products",
                            "created_at": "2020-04-19T08:37:10.179Z",
                            "updated_at": "2020-07-31T09:10:17.080Z"
                        },
                        {
                            "id": 21,
                            "name": "Widget Same Brand",
                            "slug": "widget-same-brand",
                            "created_at": "2020-04-19T09:36:13.121Z",
                            "updated_at": "2020-07-31T09:11:54.724Z"
                        },
                        {
                            "id": 22,
                            "name": "Fullwidth consumer electronic best seller",
                            "slug": "fullwidth-consumer-electronic-best-seller",
                            "created_at": "2020-06-21T10:58:15.313Z",
                            "updated_at": "2020-07-31T09:12:40.115Z"
                        },
                        {
                            "id": 28,
                            "name": "Shop Same Brand",
                            "slug": "shop-same-brand",
                            "created_at": "2021-02-20T16:27:45.899Z",
                            "updated_at": "2021-02-23T01:34:57.611Z"
                        }
                    ],
                    "stores": [
                        {
                            "id": 1,
                            "name": "Global Office",
                            "slug": "global-office",
                            "address": "325 Orchard Str, New York, United States (US)",
                            "phone": " (+053) 77-637-3300",
                            "created_at": "2021-02-15T16:10:34.972Z",
                            "updated_at": "2021-02-15T16:13:24.951Z",
                            "thumbnail": {
                                "id": 369,
                                "name": "vendor-150x150.jpg",
                                "alternativeText": "",
                                "caption": "",
                                "width": 150,
                                "height": 150,
                                "formats": null,
                                "hash": "vendor_150x150_e7c381334d",
                                "ext": ".jpg",
                                "mime": "image/jpeg",
                                "size": 4.22,
                                "url": "/uploads/vendor_150x150_e7c381334d.jpg",
                                "previewUrl": null,
                                "provider": "local",
                                "provider_metadata": null,
                                "created_at": "2021-02-15T16:13:22.005Z",
                                "updated_at": "2021-02-15T16:13:22.020Z"
                            }
                        }
                    ]
                },
            ]
        return handler.returner([true, data], api_name)//Sends response to caller - Must be at bottom of handler
    }
    catch (e) {
        console.log(e)
        return handler.returner([false, e], api_name, 500)
    }
};















