const sampleHairstyles = [
    {
        name: "Textured Crop",
        description: "A modern, low-maintenance cut that works well with your face shape. Adds volume on top while keeping sides neat.",
        image: "/static/imgs/TexturedCrop.jpg",
        suitability: "95% match",
        tags: ["modern", "low-maintenance", "professional"]
    },
    {
        name: "Side Part",
        description: "A classic style that brings balance to your facial features. Works well for both formal and casual occasions.",
        image: "/static/imgs/SidePart.jpg",
        suitability: "88% match",
        tags: ["classic", "versatile", "professional"]
    },
    {
        name: "Messy Quiff",
        description: "Adds height and volume to elongate your face. Perfect for creating a youthful, edgy look.",
        image: "/static/imgs/MessyQuiff.jpg",
        suitability: "92% match",
        tags: ["edgy", "youthful", "stylish"]
    },
    {
        name: "Buzz Cut",
        description: "A bold, minimal haircut that highlights strong facial features. Great for square or oval faces.",
        image: "/static/imgs/BuzzCut.jpg",
        suitability: "89% match",
        tags: ["bold", "minimal", "low-maintenance"]
    },
    {
        name: "Pompadour",
        description: "Classic yet dramatic. Adds volume and height to balance rounded or heart-shaped faces.",
        image: "/static/imgs/Pompadour.jpg",
        suitability: "93% match",
        tags: ["volume", "classic", "stylish"]
    },
    {
        name: "Fringe Cut",
        description: "A trendy style that adds interest to the forehead area. Great for longer or oblong faces.",
        image: "/static/imgs/FringeCut.jpg",
        suitability: "87% match",
        tags: ["trendy", "youthful", "fashion"]
    }
];

const faceShapeToHairstyles = {
    Heart: [
        { name: "Textured Crop", suitability: 95 },
        { name: "Pompadour", suitability: 93 },
        { name: "Side Part", suitability: 88 }
    ],
    Oblong: [
        { name: "Fringe Cut", suitability: 87 },
        { name: "Messy Quiff", suitability: 92 },
        { name: "Side Part", suitability: 85 }
    ],
    Oval: [
        { name: "Buzz Cut", suitability: 89 },
        { name: "Textured Crop", suitability: 94 },
        { name: "Side Part", suitability: 90 }
    ],
    Round: [
        { name: "Messy Quiff", suitability: 92 },
        { name: "Pompadour", suitability: 93 },
        { name: "Textured Crop", suitability: 91 }
    ],
    Square: [
        { name: "Buzz Cut", suitability: 89 },
        { name: "Side Part", suitability: 88 },
        { name: "Messy Quiff", suitability: 90 }
    ]
};

export function chooseHair(shape) {
    const selectedFaceShape = shape;

    const matchedHairstyles = faceShapeToHairstyles[selectedFaceShape]
        .map(item => sampleHairstyles.find(h => h.name === item.name))
        .filter(Boolean);

    console.log(matchedHairstyles);
    return matchedHairstyles;

}
