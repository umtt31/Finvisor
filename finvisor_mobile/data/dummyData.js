import { userImages, postImages, stockImages } from './dummyImages';

export const postData = [
    {
        userInfo: {
            id: 1,
            name: 'John Doe',
            username: '@johndoe',
            profilePicture: userImages.user1
        },
        postContent: {
            id: 101,
            text: 'This is my first post! Excited to share more.',
            image: postImages.post1
        },
        likeComment: {
            likes: 120,
            comments: 45
        }
    },
    {
        userInfo: {
            id: 2,
            name: 'Jane Smith',
            username: '@janesmith',
            profilePicture: userImages.user2
        },
        postContent: {
            id: 102,
            text: 'Just finished my morning jog. Beautiful day!',
            image: postImages.post2
        },
        likeComment: {
            likes: 89,
            comments: 12
        }
    },
    {
        userInfo: {
            id: 3,
            name: 'Alex Johnson',
            username: '@alexj',
            profilePicture: userImages.user3
        },
        postContent: {
            id: 103,
            text: 'Check out this amazing sunset view from my balcony!',
        },
        likeComment: {
            likes: 234,
            comments: 67
        }
    },
    {
        userInfo: {
            id: 4,
            name: 'Maria Garcia',
            username: '@mariagarcia',
            profilePicture: userImages.user4
        },
        postContent: {
            id: 104,
            text: 'Just released my new album. Link in bio!',
            image: postImages.post4
        },
        likeComment: {
            likes: 543,
            comments: 98
        }
    },
    {
        userInfo: {
            id: 5,
            name: 'Robert Chen',
            username: '@robchen',
            profilePicture: userImages.user5
        },
        postContent: {
            id: 105,
            text: 'My latest coding project is finally complete after 3 months of work!',
        },
        likeComment: {
            likes: 176,
            comments: 54
        }
    },
    {
        userInfo: {
            id: 6,
            name: 'Sarah Williams',
            username: '@sarahw',
            profilePicture: userImages.user6
        },
        postContent: {
            id: 106,
            text: 'Had the best time at the concert last night!',
            image: postImages.post6
        },
        likeComment: {
            likes: 321,
            comments: 43
        }
    },
    {
        userInfo: {
            id: 7,
            name: 'David Kim',
            username: '@davidk',
            profilePicture: userImages.user7
        },
        postContent: {
            id: 107,
            text: 'My new book is now available for pre-order. So excited to share it with you all!',
        },
        likeComment: {
            likes: 432,
            comments: 87
        }
    },
    {
        userInfo: {
            id: 8,
            name: 'Emily Rodriguez',
            username: '@emilyrod',
            profilePicture: userImages.user8
        },
        postContent: {
            id: 108,
            text: 'Cooking my grandmother\'s special recipe today. Smells delicious!',
            image: postImages.post8
        },
        likeComment: {
            likes: 210,
            comments: 38
        }
    },
    {
        userInfo: {
            id: 9,
            name: 'Michael Brown',
            username: '@mikebrown',
            profilePicture: userImages.user9
        },
        postContent: {
            id: 109,
            text: 'Just hit my fitness goal for the month. Hard work pays off!',
        },
        likeComment: {
            likes: 154,
            comments: 29
        }
    },
    {
        userInfo: {
            id: 10,
            name: 'Lisa Wang',
            username: '@lisawang',
            profilePicture: userImages.user10
        },
        postContent: {
            id: 110,
            text: 'Visited the art museum today. Such incredible exhibitions!',
        },
        likeComment: {
            likes: 267,
            comments: 51
        }
    }
];


export const searchData = [
    {
        id: 1,
        name: 'John Doe',
        username: '@johndoe',
        profilePicture: userImages.user1
    },
    {
        id: 2,
        name: 'Jane Smith',
        username: '@janesmith',
        profilePicture: userImages.user2
    },
    {
        id: 3,
        name: 'Alex Johnson',
        username: '@alexj',
        profilePicture: userImages.user3
    },
    {
        id: 4,
        name: 'Maria Garcia',
        username: '@mariagarcia',
        profilePicture: userImages.user4
    },
    {
        id: 5,
        name: 'Robert Chen',
        username: '@robchen',
        profilePicture: userImages.user5
    },
    {
        id: 6,
        name: 'Sarah Williams',
        username: '@sarahw',
        profilePicture: userImages.user6
    },
    {
        id: 7,
        name: 'David Kim',
        username: '@davidk',
        profilePicture: userImages.user7
    },
    {
        id: 8,
        name: 'Emily Rodriguez',
        username: '@emilyrod',
        profilePicture: userImages.user8
    },
    {
        id: 9,
        name: 'Michael Brown',
        username: '@mikebrown',
        profilePicture: userImages.user9
    },
    {
        id: 10,
        name: 'Lisa Wang',
        username: '@lisawang',
        profilePicture: userImages.user10
    }
];

export const stockData = [
    {
        id: 1,
        name: 'Apple Inc.',
        symbol: 'AAPL',
        price: "145.09",
        change: -0.45,
        image: stockImages.stockApple
    },
    {
        id: 2,
        name: 'Amazon.com Inc.',
        symbol: 'AMZN',
        price: "3,345.55",
        change: 1.23,
        image: stockImages.stockAmazon
    },
    {
        id: 3,
        name: 'Alphabet Inc. (Google)',
        symbol: 'GOOGL',
        price: "2, 800.00",
        change: 0.67,
        image: stockImages.stockGoogle
    },
    {
        id: 4,
        name: 'Microsoft Corporation',
        symbol: 'MSFT',
        price: "299.35",
        change: -0.12,
        image: stockImages.stockMicrosoft
    },
    {
        id: 5,
        name: 'Tesla Inc.',
        symbol: 'TSLA',
        price: "688.99",
        change: 2.45,
        image: stockImages.stockTesla
    },
    {
        id: 6,
        name: 'Meta Platforms Inc.',
        symbol: 'META',
        price: "355.55",
        change: -1.23,
        image: stockImages.stockMeta
    },
    {
        id: 7,
        name: 'MasterCard Incorporated',
        symbol: 'MA',
        price: "350.00",
        change: 0.45,
        image: stockImages.stockMasterCard
    },
    {
        id: 8,
        name: 'Walmart Inc.',
        symbol: 'WMT',
        price: 140.00,
        change: "-0.78",
        image: stockImages.stockWallmart
    },
    {
        id: 9,
        name: 'Spotify Technology S.A.',
        symbol: 'SPOT',
        price: "250.00",
        change: 1.56,
        image: stockImages.stockSpotify
    },
    {
        id: 10,
        name: 'NVIDIA Corporation',
        symbol: 'NVDA',
        price: "200.00",
        change: -0.89,
        image: stockImages.stockNvidia
    }
];
