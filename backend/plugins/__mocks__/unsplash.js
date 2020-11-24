/* Module we want to mock */
const imageUtil = jest.createMockFromModule("./unsplash");

/* Function in mocked modules we are mocking */
async function getImage(searchString) {
    return(`https://${searchString}.com`);
}

/* Export the module */
imageUtil.getImage = getImage;
module.exports = imageUtil;
